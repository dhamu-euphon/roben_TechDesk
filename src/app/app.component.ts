import { Component } from '@angular/core';

import { Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ActivityService } from './services/services';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  public onlineOffline: boolean = navigator.onLine;
  private pushTimer: any;

  constructor(
    private activityService: ActivityService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private toastController: ToastController
  ) {
    this.initializeApp();
    this.networkListener();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  networkListener() {
    window.addEventListener('offline', () => {
      clearInterval(this.pushTimer);
      this.updateNetworkStatus('Offline');
    });

    window.addEventListener('online', () => {
      this.pushTimer = setInterval(() => {
        this.activityService.pushActivities();
      }, 15000);
      this.updateNetworkStatus('Online');
    });
    this.pushTimer = setInterval(() => {
      this.activityService.pushActivities();
    }, 15000);
  }

  private async updateNetworkStatus(connection: string) {
    let toast = this.toastController.create({
      message: 'You are now ' + connection,
      duration: 3000,
      position: 'bottom'
    });
    toast.then(toast => toast.present());
  }

}
