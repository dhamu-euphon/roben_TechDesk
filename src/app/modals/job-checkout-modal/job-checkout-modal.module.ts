import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JobCheckoutModalPageRoutingModule } from './job-checkout-modal-routing.module';

import { JobCheckoutModalPage } from './job-checkout-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JobCheckoutModalPageRoutingModule
  ],
  declarations: [JobCheckoutModalPage]
})
export class JobCheckoutModalPageModule {}
