import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobCheckoutModalPage } from './job-checkout-modal.page';

const routes: Routes = [
  {
    path: '',
    component: JobCheckoutModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobCheckoutModalPageRoutingModule {}
