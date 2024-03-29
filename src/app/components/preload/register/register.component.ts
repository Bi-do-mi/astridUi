import {Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective, NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../../../_services/user.service';
import {first, delay} from 'rxjs/operators';
import {NgxSpinnerService} from 'ngx-spinner';
import {User} from '../../../_model/User';
import {HttpErrorResponse} from '@angular/common/http';
import {NGXLogger} from 'ngx-logger';
import {SnackBarService} from '../../../_services/snack-bar.service';
import {MessageService} from '../../../_services/message.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {ErrorStateMatcher} from '@angular/material/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  registerForm: FormGroup;
  loading = false;
  submitted = false;
  userCredentials = {username: '', password: '', name: ''};
  hide = true;
  matcher = new MyErrorStateMatcher();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private snackBarService: SnackBarService,
    private logger: NGXLogger,
    private messageService: MessageService) {
  }

  // todo: сделать корпоротивный адрес у гугла
  // todo: https://support.google.com/work/mail/answer/6236599?utm_source=rw&utm_medium=sup&utm_campaign=/gmail&utm_content=0a&authuser=0
  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      login: ['', [Validators.maxLength(60),
        Validators.pattern('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)' +
          '|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)' +
          '+[a-zA-Z]{2,}))$|^(\\+7|8)?[-\\(]?\\d{3}\\)?-?\\d{3}-?\\d{2}-?\\d{2}$')]],
      // это паттерн на почту и телефон
      // Validators.pattern('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)' +
      //   '|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])' +
      //   '|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$|^(\\+7|8)?[-\\(]?\\d{3}\\)?-?\\d{3}-?\\d{2}-?\\d{2}$')]],
      password: ['', [Validators.minLength(8)
        , Validators.maxLength(30)
        , Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')]],
      repeat_password: [''],
      name: ['', [Validators.minLength(1),
        Validators.maxLength(60),
      Validators.pattern('^([а-яА-ЯA-Za-z0-9 -]*)$')]]
    }, {validators: this.checkPasswords});
    this.userService.logout();
  }

  ngOnDestroy() {
  }

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    const pass = group.controls.password.value;
    const confirmPass = group.controls.repeat_password.value;
    return pass === confirmPass ? null : {notSame: true};
  }

  get f() {
    return this.registerForm.controls;
  }

  checkUserName(user_name: string) {
    if (user_name) {
      this.userService.getByName(user_name)
        .pipe(first(), delay(1000), untilDestroyed(this))
        .subscribe(data => {
            if (user_name === data) {
              this.registerForm.controls['login'].setErrors({occupied: true});
            } else {
              this.registerForm.controls['login'].setErrors({occupied: false});
              this.registerForm.controls['login'].updateValueAndValidity();
            }
          },
          error => {
            // this.logger.info(error);
          });
    }
  }

  onSubmit() {
    this.submitted = true;
    // stop here if optionsForm is invalid
    if (this.registerForm.invalid) {
      return;
    }
    this.loading = true;
    this.initUser();
    this.userService.register(this.userCredentials)
      .pipe(first(), untilDestroyed(this))
      .subscribe(
        data => {
          this.loading = false;
          this.router.navigate(['/preload/login']);
          // this.snackBarService.success('Для завершения регистрации проверьте почту.',
          //   'OK', 100000);
          this.messageService.add(['Регистрация.', 'Для завершения' +
          ' процесса регистрации, пожалуйста, проверьте свой электронный ' +
          'почтовый ящик. Пройдите по ссылке, которую мы выслали Вам в письме.']);
          this.router.navigate(['/preload/info']);
        },
        error => {
          this.loading = false;
          if (error instanceof HttpErrorResponse && error.status === 409) {
            this.snackBarService.error('Логин "' + this.userCredentials.username
              + '" занят. Выберите другой логин.');
          } else {
            this.logger.error(error);
          }
        });
  }

  initUser() {
    this.userCredentials.username = this.registerForm.controls['login'].value;
    this.userCredentials.password = this.registerForm.controls['password'].value;
    this.userCredentials.name = this.registerForm.controls['name'].value;
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.touched);
    return (invalidCtrl || form.hasError('notSame'));
  }
}
