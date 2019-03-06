import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../_services/user.service';
import {SnackBarService} from '../../_services/snack-bar.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {User} from '../../_model/User';
import {untilDestroyed} from 'ngx-take-until-destroy';

@Component({
  selector: 'app-delete-user-dialog',
  templateUrl: './delete-user-dialog.component.html',
  styleUrls: ['./delete-user-dialog.component.scss']
})
export class DeleteUserDialogComponent implements OnInit, OnDestroy {

  user = new User();
  loading = false;
  submitted = false;
  excepted = false;

  constructor(
    private dialogRef: MatDialogRef<DeleteUserDialogComponent>,
    private userService: UserService,
    private snackBarService: SnackBarService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.userService.currentUser.pipe(untilDestroyed(this))
      .subscribe(u => this.user = u);
  }

  ngOnDestroy() {
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    this.spinner.show();
    this.userService.delete(this.user)
      .pipe(first(), untilDestroyed(this))
      .subscribe(u => {
          if (u === true) {
            // console.log(u);
            this.loading = false;
            this.spinner.hide();
            this.dialogRef.close(true);
            this.snackBarService.success('Ваш аккаунт был удален.',
              'OK', 10000);
          } else {
            this.loading = false;
            this.spinner.hide();
            this.dialogRef.close(false);
            this.snackBarService.error('Процесс удаления прерван.',
              'OK', 10000);
          }
        },
        error => {
          this.loading = false;
          this.spinner.hide();
          console.log(error);
          this.snackBarService.error('Что-то пошло не так.');
        });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
