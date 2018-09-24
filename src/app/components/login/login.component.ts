import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService} from '../../_services/alert.service';
import {delay, first} from 'rxjs/operators';
import {NgxSpinnerService} from 'ngx-spinner';
import {NGXLogger} from 'ngx-logger';
import {HttpErrorResponse} from '@angular/common/http';
import {UserService} from '../../_services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  repairForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  credentials = {login: '', password: '', newPassword: '', token: ''};
  hide = true;
  tabIndex = 0;
  token = '';
  newPasswordShow = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private spinner: NgxSpinnerService,
    private  logger: NGXLogger,
    private userService: UserService) {
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.email],
      password: ['', Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')],
      newPassword: ['', Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')]
    });
    this.repairForm = this.formBuilder.group({
      login: ['', Validators.email]
    });
    this.userService.logout();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.route.snapshot.queryParams['token'] &&
      this.route.snapshot.queryParams['target'] === 'enable_user') {
      this.enableUser(this.route.snapshot.queryParams['token']);
    }
    if (this.route.snapshot.queryParams['target'] === 'new_password') {
      this.newPasswordShow = true;
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  get r() {
    return this.repairForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.logger.info('invalid form. return');
      return;
    }
    this.loading = true;
    this.spinner.show();
    this.credentials.login = this.f.login.value;
    this.credentials.password = this.f.password.value;
    this.credentials.newPassword = this.f.newPassword.value;
    if (this.route.snapshot.queryParams['token']) {
      this.token = this.route.snapshot.queryParams['token'];
    }
    this.userService.login(this.credentials, this.token)
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

  onRepair() {
    this.submitted = true;
    if (this.repairForm.invalid) {
      this.logger.info('invalid form. return ' + this.repairForm.errors);
      return;
    }
    this.loading = true;
    this.spinner.show();
    this.userService.setUserToken(this.r.login.value)
      .pipe(first())
      .subscribe(
        data => {
          if (data === 'set_user_token true') {
            this.loading = false;
            this.spinner.hide();
            this.changeTab();
            this.alertService.success('Для смены пароля проверьте почту.');
          }
        },
        error => {
          this.loading = false;
          this.spinner.hide();
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.alertService.error('Этот логин не зарегистрирован.');
          }
        }
      );
  }

  enableUser(token: string) {
    this.spinner.show();
    this.userService.enableUser(token)
      .pipe(first())
      .subscribe(data => {
          if (data) {
            this.spinner.hide();
          }
        },
        error => {
          this.spinner.hide();
          this.logger.info(error);
        });
  }

  changeTab() {
    if (this.tabIndex === 0) {
      this.tabIndex = 1;
    } else {
      this.tabIndex = 0;
    }
  }

}
