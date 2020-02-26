import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { LoginService } from '../services/services'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy, AfterViewInit {

  loginForm: FormGroup;
  submitAttempt: boolean = false;
  errorMsg: string = "Please enter a password.";
  backButtonSubscription;

  constructor(private formBuilder: FormBuilder, private loginService: LoginService, public platform: Platform, private router: Router) {
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required]]
    });
  }

  loginAction() {
    this.submitAttempt = true;
    if (this.loginForm.valid) {
      this.loginService.authenticate(this.loginForm.value['username'], this.loginForm.value['password']).then(response => {
        let data = JSON.parse(response.data);
        if (parseInt(data.status) == 1) {
          this.errorMsg = data.ERROR.exceptionMsg;
          this.loginForm.controls['password'].setErrors({ "incorrect": true });
        } else {
          this.loginService.setSession(data);
          this.router.navigate(['/home']);
        }
      }).catch(errors => {
        this.errorMsg = "Login failed";
        this.loginForm.controls['password'].setErrors({ "incorrect": true });
      });
    }
  }

  ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      navigator['app'].exitApp();
    });
  }

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }

}
