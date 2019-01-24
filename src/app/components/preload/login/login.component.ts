import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {filter, first} from 'rxjs/operators';
import {NgxSpinnerService} from 'ngx-spinner';
import {NGXLogger} from 'ngx-logger';
import {HttpErrorResponse} from '@angular/common/http';
import {UserService} from '../../../_services/user.service';
import {SnackBarService} from '../../../_services/snack-bar.service';
import {MessageService} from '../../../_services/message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  repairForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  credentials = {login: '', password: '', newPassword: '', token: ''};
  hidePresentPassword = true;
  hideNewPassword = true;
  tabIndex = 0;
  token = '';
  newPasswordShow = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private  logger: NGXLogger,
    private userService: UserService,
    private snackBarService: SnackBarService) {
    router.events.pipe(
      filter(a => a instanceof NavigationStart)
    ).subscribe(_ => this.snackBarService.close());
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
    this.returnUrl = this.route.snapshot.paramMap.get('returnUrl') || '/';
    if (this.route.snapshot.queryParamMap.get('token') &&
      this.route.snapshot.queryParamMap.get('target') === 'enable_user') {
      this.enableUser(this.route.snapshot.queryParamMap.get('token'));
    }
    if (this.route.snapshot.queryParamMap.get('target') === 'new_password') {
      this.newPasswordShow = true;
    }
    if (this.route.snapshot.queryParamMap.get('tab2') === 'tab2') {
      this.changeTab();
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
    this.credentials.password = this.f.password.value || this.f.newPassword.value;
    this.credentials.newPassword = this.f.newPassword.value;
    if (this.route.snapshot.queryParamMap.get('token')) {
      this.token = this.route.snapshot.queryParamMap.get('token');
    }
    if (this.route.snapshot.queryParamMap.get('target') === 'new_password') {
      this.userService.changePassword(this.credentials, this.token)
        .pipe(first())
        .subscribe(
          data => {
            this.loading = false;
            this.spinner.hide();
            // this.logger.info('from login component change password');
            this.router.navigate([this.returnUrl]);
            this.snackBarService.success('Пароль был изменен', 'OK');
          },
          error => {
            this.loading = false;
            this.spinner.hide();
            this.snackBarService.error(error.toString().replace('Error:', 'Ошибка: '),
              'OK');
          }
        );
    } else {
      this.userService.login(this.credentials, this.token)
        .pipe(first())
        .subscribe(
          data => {
            this.loading = false;
            this.spinner.hide();
            // this.logger.info('from login/// returnURL=', this.returnUrl);
            this.router.navigate([this.returnUrl]);
          },
          error => {
            this.loading = false;
            this.spinner.hide();
            if (error instanceof HttpErrorResponse && error.status === 401) {
              this.snackBarService.error('Неправильный логин или пароль.');
            }
          }
        );
    }
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
            this.messageService.add(['Смена пароля', 'Для завершения' +
              ' процесса изменения пароля, пожалуйста, проверьте свой электронный ' +
              'почтовый ящик. Пройдите по ссылке, которую мы выслали Вам в письме.']);
            this.router.navigate(['/preload/info']);
          }
          if (data === 'No value present') {
            this.loading = false;
            this.spinner.hide();
            this.snackBarService.error('Этот логин не зарегистрирован.');
          }
        },
        error => {
          this.loading = false;
          this.spinner.hide();
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.snackBarService.error('Этот логин не зарегистрирован.');
          }
        }
      );
  }

  enableUser(token: string) {
    this.spinner.show();
    this.userService.enableUser(token)
      .pipe(first())
      .subscribe(data => {
          if (data === 'true') {
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
