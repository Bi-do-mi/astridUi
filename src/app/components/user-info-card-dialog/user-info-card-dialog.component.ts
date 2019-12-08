import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {User} from '../../_model/User';

@Component({
  selector: 'app-user-info-card-dialog',
  templateUrl: './user-info-card-dialog.component.html',
  styleUrls: ['./user-info-card-dialog.component.scss']
})
export class UserInfoCardDialogComponent implements OnInit {
  private user: User;

  constructor(
    private dialogRef: MatDialogRef<UserInfoCardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private dialog: MatDialog) {
  }

  ngOnInit() {
    this.user = this.data.user;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
