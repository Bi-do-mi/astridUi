import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../../_services/user.service';
import {AlertService} from '../../_services/alert.service';
import {first} from 'rxjs/operators';
import {NgxSpinnerService} from 'ngx-spinner';
import {AuthenticationService} from '../../_services/authentication.service';
import {User} from '../../_model/User';
import {HttpErrorResponse} from '@angular/common/http';
import {NGXLogger} from 'ngx-logger';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
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
    private alertService: AlertService,
    private spinner: NgxSpinnerService,
    private authenticationService: AuthenticationService,
    private logger: NGXLogger) {
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.maxLength(60),
        Validators.pattern('^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\\d.-]{0,59}$')]],
      password: ['', [Validators.minLength(8)
        , Validators.maxLength(30)
        , Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')]],
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.email]]
    });
    this.authenticationService.logout();
  }

  get f() {
    return this.registerForm.controls;
  }

  checkName(user_name: string) {
    this.userService.getByName(user_name)
      .pipe(first())
      .subscribe(data => {
          if (user_name === data) {
            this.registerForm.controls['username'].setErrors({occupied: true});
          } else {
            this.registerForm.controls['username'].setErrors({occupied: false});
            this.registerForm.controls['username'].updateValueAndValidity();
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
          this.alertService.success('Регистрация прошла успешно.\n Введите логин и пароль.'
            , true);
          this.loading = false;
          this.spinner.hide();
          this.router.navigate(['/login']);
        },
        error => {
          this.loading = false;
          this.spinner.hide();
          if (error instanceof HttpErrorResponse && error.status === 409) {
            this.alertService.error('Логин "' + this.newUser.username
              + '" занят. Выберите другой логин.');
          }
        });
  }

  initUser(): User {
    this.newUser.username = this.registerForm.controls['username'].value;
    this.newUser.password = this.registerForm.controls['password'].value;
    this.newUser.firstName = this.registerForm.controls['firstName'].value;
    this.newUser.lastName = this.registerForm.controls['lastName'].value;
    this.newUser.email = this.registerForm.controls['email'].value;
    return this.newUser;
  }
}
