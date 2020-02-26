import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-job-checkout-modal',
  templateUrl: './job-checkout-modal.page.html',
  styleUrls: ['./job-checkout-modal.page.scss'],
})
export class JobCheckoutModalPage implements OnInit {
  comments: String = "";
  status: String = "";

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() { }

  checkout() {
    this.modalCtrl.dismiss({ 'action': 'checkout', 'comments': this.comments, 'status': this.status });
  }

  cancel() {
    this.modalCtrl.dismiss({ 'action': 'cancel' });
  }

}
