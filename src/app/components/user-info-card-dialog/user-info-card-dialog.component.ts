import {Component, Inject, OnInit} from '@angular/core';
import {User} from '../../_model/User';
import {ZonedDateTime} from '@js-joda/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-user-info-card-dialog',
  templateUrl: './user-info-card-dialog.component.html',
  styleUrls: ['./user-info-card-dialog.component.scss']
})
export class UserInfoCardDialogComponent implements OnInit {
  public user: User;

  constructor(
    private dialogRef: MatDialogRef<UserInfoCardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private dialog: MatDialog) {
  }

  ngOnInit() {
    this.user = this.data.user;
    // console.log(this.data.user.registrationDate.toJSON());
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
