import {Component, OnInit} from '@angular/core';
import {UserService} from '../../_services/user.service';
import {SnackBarService} from '../../_services/snack-bar.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {User} from '../../_model/User';

@Component({
  selector: 'app-delete-user-dialog',
  templateUrl: './delete-user-dialog.component.html',
  styleUrls: ['./delete-user-dialog.component.scss']
})
export class DeleteUserDialogComponent implements OnInit {

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
    this.userService.currentUser.subscribe(u => this.user = u);
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    this.spinner.show();
    this.userService.delete(this.user)
      .pipe(first())
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
