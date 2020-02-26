import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JobCheckoutModalPage } from './job-checkout-modal.page';

describe('JobCheckoutModalPage', () => {
  let component: JobCheckoutModalPage;
  let fixture: ComponentFixture<JobCheckoutModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobCheckoutModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JobCheckoutModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
