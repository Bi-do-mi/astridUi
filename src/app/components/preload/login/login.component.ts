import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {filter, first} from 'rxjs/operators';
import {NgxSpinnerService} from 'ngx-spinner';
import {NGXLogger} from 'ngx-logger';
import {HttpErrorResponse} from '@angular/common/http';
import {UserService} from '../../../_services/user.service';
import {SnackBarService} from '../../../_services/snack-bar.service';
import {MessageService} from '../../../_services/message.service';
import {untilDestroyed} from 'ngx-take-until-destroy';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

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
    private  logger: NGXLogger,
    private userService: UserService,
    private snackBarService: SnackBarService) {
    router.events.pipe(
      filter(a => a instanceof NavigationStart),
      untilDestroyed(this)
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
    if (this.route.snapshot.queryParamMap.get('token')) {
      this.token = this.route.snapshot.queryParamMap.get('token');
    }
    if (this.route.snapshot.queryParamMap.get('target') === 'new_password') {
      this.newPasswordShow = true;
    }
    if (this.route.snapshot.paramMap.get('tab')) {
      this.tabIndex = +this.route.snapshot.paramMap.get('tab');
    }
  }

  ngOnDestroy() {
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
      this.logger.info('invalid optionsForm. return');
      return;
    }
    this.loading = true;
    this.credentials.login = this.f.login.value;
    this.credentials.password = this.f.password.value || this.f.newPassword.value;
    this.credentials.newPassword = this.f.newPassword.value;
    if (this.route.snapshot.queryParamMap.get('target') === 'new_password') {
      this.userService.changePassword(this.credentials, this.token)
        .pipe(first(), untilDestroyed(this))
        .subscribe(
          data => {
            this.loading = false;
            // this.logger.info('from login component change password');
            this.router.navigate([this.returnUrl]);
            this.snackBarService.success('Пароль был изменен', 'OK');
          },
          error => {
            this.loading = false;
            this.snackBarService.error(error.toString().replace('Error:', 'Ошибка: '),
              'OK');
          }
        );
    } else {
      if (this.token &&
        this.route.snapshot.queryParamMap.get('target') === 'enable_user') {
        this.enableUser(this.credentials, this.token);
      } else {
        this.login(this.credentials, this.token);
      }
    }
  }

  login(credentials, token) {
    this.userService.login(this.credentials, this.token)
      .pipe(first(), untilDestroyed(this))
      .subscribe(
        data => {
          this.loading = false;
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.loading = false;
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.snackBarService.error('Неправильный логин или пароль.', 'OK');
          }
          // else {
          //   this.snackBarService.error(error.toString().replace('Error:', 'Ошибка: '),
          //     'OK');
          // }
        }
      );
  }

  onRepair() {
    this.submitted = true;
    if (this.repairForm.invalid) {
      this.logger.info('invalid optionsForm. return ' + this.repairForm.errors);
      return;
    }
    this.loading = true;
    this.userService.setUserToken(this.r.login.value)
      .pipe(first(), untilDestroyed(this))
      .subscribe(
        data => {
          if (data === 'set_user_token true') {
            this.loading = false;
            this.changeTab();
            this.messageService.add(['Смена пароля', 'Для завершения' +
            ' процесса изменения пароля, пожалуйста, проверьте свой электронный ' +
            'почтовый ящик. Пройдите по ссылке, которую мы выслали Вам в письме.']);
            this.router.navigate(['/preload/info']);
          }
          if (data === 'No value present') {
            this.loading = false;
            this.snackBarService.error('Этот логин не зарегистрирован.');
          }
        },
        error => {
          this.loading = false;
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.snackBarService.error('Этот логин не зарегистрирован.');
          }
        }
      );
  }

  enableUser(credentials, token: string) {
    // this.spinner.show();
    this.userService.enableUser(token)
      .pipe(first(), untilDestroyed(this))
      .subscribe(data => {
          if (data === 'true') {
            this.login(credentials, token);
            // this.spinner.hide();
          }
          if (data === 'not found') {
            this.newPasswordShow = false;
            this.router.navigate(['/preload/login']);
            this.snackBarService.error('Эта ссылка больше неактивна');
          }
        },
        error => {
          this.logger.info(error);
        });
  }

  changeTab() {
    if (this.tabIndex === 0) {
      this.tabIndex = 1;
    } else {
      this.tabIndex = 0;
    }
    this.logger.log('changeTab() work!');
  }

}
