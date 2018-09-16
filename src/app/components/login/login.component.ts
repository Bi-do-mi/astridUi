import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../_services/authentication.service';
import {AlertService} from '../../_services/alert.service';
import {first} from 'rxjs/operators';
import {NgxSpinnerService} from 'ngx-spinner';
import {NGXLogger} from 'ngx-logger';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  credentials = {username: '', password: ''};
  hide = true;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private spinner: NgxSpinnerService,
    private  logger: NGXLogger) {
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.authenticationService.logout();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    // this.logger.info('in ngOnInit');
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.logger.info('invalid form. return');
      return;
    }
    this.loading = true;
    this.spinner.show();
    this.credentials.username = this.f.username.value;
    this.credentials.password = this.f.password.value;
    this.authenticationService.login(this.credentials)
      .pipe(first())
      .subscribe(
        data => {
          this.loading = false;
          this.spinner.hide();
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.loading = false;
          this.spinner.hide();
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.alertService.error('Неправильный логин или пароль.');
          }
        }
      );
  }
}
