import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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
      username: ['', [Validators.required, Validators.maxLength(60)]],
      password: ['', [Validators.required
        , Validators.minLength(6)
        , Validators.maxLength(30)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required
        , Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]]
    });
    this.authenticationService.logout();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
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
