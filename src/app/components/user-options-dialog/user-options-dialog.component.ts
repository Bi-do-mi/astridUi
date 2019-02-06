import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {UserService} from '../../_services/user.service';
import {User} from '../../_model/User';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {SnackBarService} from '../../_services/snack-bar.service';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {DeleteUserDialogComponent} from '../delete-user-dialog/delete-user-dialog.component';

@Component({
  selector: 'app-user-options-dialog',
  templateUrl: './user-options-dialog.component.html',
  styleUrls: ['./user-options-dialog.component.scss']
})
export class UserOptionsDialogComponent implements OnInit {

  user = new User();
  updateForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private dialogRef: MatDialogRef<UserOptionsDialogComponent>,
    private dialog: MatDialog,
    private userService: UserService,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private snackBarService: SnackBarService) {
  }

  ngOnInit() {
    this.userService.currentUser.subscribe(u => this.user = u);
    this.updateForm = this.formBuilder.group({
      firstName: [this.user.firstName, [Validators.minLength(1),
        Validators.maxLength(60)]],
      lastName: [this.user.lastName, [Validators.minLength(1),
        Validators.maxLength(60)]],
      login: [{value: this.user.username, disabled: true}],
      phoneNumber: [this.user.phoneNumber, Validators.pattern('^\\+?[\\d\\(\\)\\-]{10,15}\\d+$')]
    });
  }

  get f() {
    return this.updateForm.controls;
  }

  onChangePass() {
    this.onCancel();
    this.router.navigate(['/preload/login',
      {
        returnUrl: this.router.routerState.snapshot.url,
        tab: '1'
      }]);
  }

  onDeleteAc() {
    const dial = this.dialog.open(DeleteUserDialogComponent, {
    });
    this.onCancel();
    dial.afterClosed().subscribe(result => {
      if ( result ) {
        this.onCancel();
        this.userService.logout();
        this.router.navigate(['/']);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    this.submitted = true;
    if (this.updateForm.invalid) {
      return;
    }
    this.loading = true;
    this.spinner.show();
    this.updateUser();
    this.userService.updateUser(this.user)
      .pipe(first())
      .subscribe(u => {
          this.loading = false;
          this.spinner.hide();
          this.dialogRef.close();
          this.snackBarService.success('Данные успешно сохранены.',
            'OK', 10000);
        },
        error => {
          this.loading = false;
          this.spinner.hide();
          console.log(error);
          this.snackBarService.error('Что-то пошло не так.');
        });
  }

  updateUser() {
    this.user.firstName = this.updateForm.controls['firstName'].value;
    this.user.lastName = this.updateForm.controls['lastName'].value;
    this.user.phoneNumber = this.updateForm.controls['phoneNumber'].value;
  }
}
