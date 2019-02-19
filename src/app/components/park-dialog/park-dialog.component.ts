import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material';
import {UserOptionsDialogComponent} from '../user-options-dialog/user-options-dialog.component';
import {UserService} from '../../_services/user.service';
import {User} from '../../_model/User';

@Component({
  selector: 'app-park-dialog',
  templateUrl: './park-dialog.component.html',
  styleUrls: ['./park-dialog.component.scss']
})
export class ParkDialogComponent implements OnInit {

  currentUser: User;
  formGroup: FormGroup;
  submitted = false;
  loading = false;

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private dialogRef: MatDialogRef<UserOptionsDialogComponent>) {
  }

  ngOnInit() {
    this.userService.currentUser.subscribe(u => {
      this.currentUser = u;
    });
    this.formGroup = this.formBuilder.group({
      parkName: [this.currentUser.parkName, Validators.maxLength(60)],
      location: [{value: '', disabled: true}]
    });
  }

  onParkCreateCancel(): void {
    this.dialogRef.close();
  }

  setMarker() {

  }

}
