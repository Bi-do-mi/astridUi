import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {SnackBarService} from '../../_services/snack-bar.service';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-unit-options-dialog',
  templateUrl: './unit-options-dialog.component.html',
  styleUrls: ['./unit-options-dialog.component.scss']
})
export class UnitOptionsDialogComponent implements OnInit {

  updateForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(private formBuilder: FormBuilder,
              private spinner: NgxSpinnerService,
              private snackBarService: SnackBarService,
              private dialogRef: MatDialogRef<UnitOptionsDialogComponent>) {
  }

  ngOnInit() {
  }

}
