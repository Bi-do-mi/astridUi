import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../../../_services/user.service';
import {first, delay} from 'rxjs/operators';
import {NgxSpinnerService} from 'ngx-spinner';
import {User} from '../../../_model/User';
import {HttpErrorResponse} from '@angular/common/http';
import {NGXLogger} from 'ngx-logger';
import {SnackBarService} from '../../../_services/snack-bar.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  loading = false;
  submitted = false;
  newUser = new User();
  hide = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private snackBarService: SnackBarService,
    private spinner: NgxSpinnerService,
    private logger: NGXLogger) {
  }

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
      firstName: [''],
      lastName: ['']
    });
    this.userService.logout();
  }

  get f() {
    return this.registerForm.controls;
  }

  checkName(user_name: string) {
    // this.logger.info(this.registerForm.controls['login'].errors);
    this.userService.getByName(user_name)
      .pipe(first(), delay(1000))
      .subscribe(data => {
          if (user_name === data) {
            this.registerForm.controls['login'].setErrors({occupied: true});
          } else {
            this.registerForm.controls['login'].setErrors({occupied: false});
            this.registerForm.controls['login'].updateValueAndValidity();
          }
        },
        error => {
          this.logger.info(error);
        });
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    this.loading = true;
    this.spinner.show();
    this.initUser();
    this.userService.register(this.newUser)
      .pipe(first())
      .subscribe(
        data => {
          this.loading = false;
          this.spinner.hide();
          this.router.navigate(['/login']);
          this.snackBarService.success('Для завершения регистрации проверьте почту.',
            'OK', 100000);
        },
        error => {
          this.loading = false;
          this.spinner.hide();
          if (error instanceof HttpErrorResponse && error.status === 409) {
            this.snackBarService.error('Логин "' + this.newUser.username
              + '" занят. Выберите другой логин.');
          }
        });
  }

  initUser(): User {
    this.newUser.username = this.registerForm.controls['login'].value;
    this.newUser.password = this.registerForm.controls['password'].value;
    this.newUser.firstName = this.registerForm.controls['firstName'].value;
    this.newUser.lastName = this.registerForm.controls['lastName'].value;
    return this.newUser;
  }
}
