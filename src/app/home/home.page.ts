import { Component } from '@angular/core';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import * as moment from 'moment';
import { ActivityService, JobCheckinService, LoginService, ScheduleService } from '../services/services';
import { JobCheckoutModalPage } from '../modals/job-checkout-modal/job-checkout-modal.page';
import { ScheduleList } from '../models/schedule-list';
import { Coordinate } from '../models/coordinate';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  username: string = "";
  today: Date = new Date();
  dates: string = moment(this.today).format('DD MMMM YYYY');
  dateStr: String = moment(this.today).format('DD MMMM YYYY');
  simpleDate: String = "Today";
  tomorrow: Date = this.today;
  yesterday: Date = this.today;
  network: boolean = true;
  officeCheck: boolean = true;
  schedules: ScheduleList[];
  lastRefresh: string = "";
  gpsLatitude: number;
  gpsLongitude: number;
  networkLatitude: number;
  networkLongitude: number;

  constructor(
    private activityService: ActivityService,
    private alertController: AlertController,
    private jobCheckinService: JobCheckinService,
    private loadingController: LoadingController,
    private router: Router,
    private loginService: LoginService,
    private modalController: ModalController,
    private scheduleService: ScheduleService,
    private toastController: ToastController) {

    if (!this.loginService.isAuthenticated()) {
      this.router.navigateByUrl("/login");
    }
  }

  ngOnInit() {
    this.scheduleService.getData(this.today, false).subscribe(data => {
      this.schedules = data;
      this.loadingController.dismiss();
    });
    let status = localStorage.getItem('office_checkin');
    if (parseInt(status) == 1) {
      this.officeCheck = true;
    } else {
      this.officeCheck = false;
    }
  }

  showPicker() {
    this.presentLoading();
    this.scheduleService.getData(new Date(this.dates), true).subscribe(data => {
      this.schedules = data;
      this.loadingController.dismiss();
      let date = moment(localStorage.getItem("lastRefresh"));
      this.lastRefresh = date.format("MMM D YYYY, h:mm:ss A");
    });
  }

  segmentChanged(ev: any) {
    let d;
    switch (this.simpleDate) {
      case 'Yesterday':
        d = this.yesterday;
        break;
      case 'Today':
        d = this.today;
        break;
      case 'Tomorrow':
        d = this.tomorrow;
        break;
    }
    this.presentLoading();
    this.scheduleService.getData(d, true).subscribe(data => {
      this.schedules = data;
      this.loadingController.dismiss();
    });
    this.dates = moment(d).format('DD MMMM YYYY');
  }

  async officeCheckAction(schedule) {
    let message = "";
    let isValid = true;
    let status = localStorage.getItem('office_checkin');
    if (parseInt(status) == 1) {
      if (this.jobCheckinService.isCheckedIn()) {
        isValid = false;
        this.ToastIt('warning', 'You cannot checkout from office when you are checked into a job.');
      }
      message = "Do you want to checkout from office?";
    } else {
      message = "Do you want to checkin to office?";
    }

    if (isValid) {
      const alert = await this.alertController.create({
        header: 'Confirm!',
        message: message,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
            }
          }, {
            text: 'Okay',
            handler: () => {
              if (parseInt(status) == 1) {
                this.officeCheckout();
              } else {
                this.officeCheckin();
              }
            }
          }
        ]
      });
      await alert.present();
    }
  }

  officeCheckin() {
    this.activityService.recordActivity(localStorage.getItem('user_id'), new Date(), "O", "I", "TD", null, this.getGpsCoordinate(), this.getNetworkCoordinate());
    localStorage.setItem('office_checkin', '1');
    this.officeCheck = true;
    this.ToastIt('success', 'Check-in to office successfully.');
  }

  officeCheckout() {
    this.activityService.recordActivity(localStorage.getItem('user_id'), new Date(), "O", "O", "TD", null, this.getGpsCoordinate(), this.getNetworkCoordinate());
    localStorage.setItem('office_checkin', '0');
    this.officeCheck = false;
    this.ToastIt('success', 'Check-out of office successfully.');
  }

  async jobCheckAction(schedule) {
    let message = "";
    let isValid = true;
    let response = this.jobCheckinService.validate(schedule.jobNumber);
    if (this.jobCheckStatus(schedule.jobNumber)) {
      /*if (response.length) {
        isValid = false;
        this.ToastIt('warning', response);
      }*/
      message = "Do you want to checkout from this job?";
    } else {
      if (!this.officeCheck) {
        isValid = false;
        this.ToastIt('warning', "You are not checked in to office.");
      } else if (response.length) {
        isValid = false;
        this.ToastIt('warning', response);
      }
      message = "Do you want to checkin to this job?";
    }
    if (isValid) {
      const alert = await this.alertController.create({
        header: 'Confirm!',
        message: message,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              //console.log('Confirm Cancel: blah');
            }
          }, {
            text: 'Okay',
            handler: () => {
              if (this.jobCheckStatus(schedule.jobNumber)) {
                this.jobCheckout(schedule);
              } else {
                this.jobCheckin(schedule);
              }
            }
          }
        ]
      });
      await alert.present();
    }
  }

  jobCheckin(schedule) {
    if (this.jobCheckinService.checkin(schedule.jobNumber)) {
      let jobDetails = {
        "jobNumber": schedule.jobNumber
      };
      this.activityService.recordActivity(localStorage.getItem('user_id'), schedule.scheduleDate, "J", "I", "TD", jobDetails, this.getGpsCoordinate(), this.getNetworkCoordinate());
      this.showPicker();
      this.ToastIt('success', 'Check-in to job successfully.');
    }
  }

  jobCheckout(schedule) {
    this.presentModal(schedule.jobNumber, schedule.scheduleDate);
  }

  jobCheckStatus(jobnumber) {
    return this.jobCheckinService.checkStatus(jobnumber);
  }

  doRefresh(event) {
    this.scheduleService.getData(new Date(this.dates), true).subscribe(data => {
      this.schedules = data;
      event.target.complete();
    });
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Loading...',
      duration: 2000
    });
    await loading.present();
    const { role, data } = await loading.onDidDismiss();
  }

  private async ToastIt(color, message) {
    let toast = this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    toast.then(toast => toast.present());
  }

  async presentModal(jobNumber, scheduleDate) {
    const modal = await this.modalController.create({
      component: JobCheckoutModalPage
    });
    modal.onWillDismiss().then(response => {
      if (response.data.action == 'checkout') {
        let jobDetails = {
          "jobNumber": jobNumber,
          "status": response.data.status,
          "comments": response.data.comments
        };
        let gpsCoordinate = {
          "latitude": this.gpsLatitude,
          "longitude": this.gpsLongitude
        };
        let networkCoordinate = {
          "latitude": this.networkLatitude,
          "longitude": this.networkLongitude
        };
        this.activityService.recordActivity(localStorage.getItem('user_id'), scheduleDate, "J", "O", "TD", jobDetails, this.getGpsCoordinate(), this.getNetworkCoordinate());
        this.jobCheckinService.checkout(jobNumber);
        this.showPicker();
        this.ToastIt('success', 'Check-out of job successfully.');
      }
    });
    return await modal.present();
  }

  getNetworkCoordinate(): Coordinate {
    let coordinate: Coordinate = {
      latitude: this.networkLatitude == undefined ? null : this.networkLatitude.toString(),
      longitude: this.networkLongitude == undefined ? null : this.networkLongitude.toString()
    };
    return coordinate;
  }

  getGpsCoordinate(): Coordinate {
    let coordinate: Coordinate = {
      latitude: this.gpsLatitude == undefined ? null : this.gpsLatitude.toString(),
      longitude: this.gpsLongitude == undefined ? null : this.gpsLongitude.toString()
    };
    return coordinate;
  }

  async logoutAction() {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Do you want ot logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.loginService.logout();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }

}
