import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {UnitAssignment, UnitBrend, UnitType} from '../../_model/UnitTypesModel';
import {ParkService} from '../../_services/park.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {finalize, first, map, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {color} from 'openlayers';
import asArray = color.asArray;
import {fromArray} from 'rxjs/internal/observable/fromArray';
import {Unit} from '../../_model/Unit';
import {UserService} from '../../_services/user.service';
import {User} from '../../_model/User';
import {SnackBarService} from '../../_services/snack-bar.service';

@Component({
  selector: 'app-unit-create',
  templateUrl: './unit-create-dialog.component.html',
  styleUrls: ['./unit-create-dialog.component.scss']
})
export class UnitCreateDialogComponent implements OnInit, OnDestroy {

  currentUser: User;
  unit = new Unit();
  loading = false;
  submitted = false;
  selectForm: FormGroup;
  unitsList = new Array<UnitAssignment>();
  unitsTypeOptions = new UnitAssignment();
  unitsBrendOptions = new UnitType();
  filteredBrends: string[];
  unitsModelOptions = new UnitBrend();
  filteredModels: string[];

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UnitCreateDialogComponent>,
    private parkService: ParkService,
    private userService: UserService,
    private snackbarService: SnackBarService
  ) {
  }

  ngOnInit() {
    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().pipe(untilDestroyed(this))
      .subscribe(_ => {
        if (window.confirm('Закрыть это окно?')) {
          this.onCancel();
        }
      });
    this.userService.currentUser.pipe(untilDestroyed(this)).subscribe(u => {
      this.currentUser = u;
    });
    this.parkService.getJSONfromFile().pipe(first(), untilDestroyed(this))
      .subscribe(data => {
        this.unitsList = data;
      });
    this.selectForm = this.formBuilder.group({
      assignmentCtrl: ['', Validators.required],
      typeCtrl: ['', Validators.required],
      brendCtrl: ['', Validators.pattern('^([а-яА-ЯA-Za-z0-9 ()-]*)$')],
      modelCtrl: ['', Validators.pattern('^([а-яА-ЯA-Za-z0-9 ()-]*)$')]
    });
    this.selectForm.get('assignmentCtrl')
      .valueChanges.subscribe((value: string) => {
        this.filterTypeList(value);
      }
    );
    this.selectForm.get('typeCtrl')
      .valueChanges.subscribe((value: string) => {
        this.filterBrendList(value);
      }
    );
    this.selectForm.get('brendCtrl')
      .valueChanges.subscribe((value: string) => {
      this.filterBrendOptions(value);
    });
    this.selectForm.get('modelCtrl')
      .valueChanges.subscribe((value: string) => {
      this.filterModelOptions(value);
    });
  }

  ngOnDestroy() {
  }

  get sf() {
    return this.selectForm.controls;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  filterTypeList(value: string) {
    this.unitsList.filter((v) => {
      if (v.assignmentname === value) {
        this.unitsTypeOptions = v;
      }
    });
    this.selectForm.get('brendCtrl').setValue('');
  }

  filterBrendList(value: string) {
    this.unitsTypeOptions.types.forEach(t => {
      if (t.typename === value) {
        this.unitsBrendOptions = t;
      }
    });
    this.selectForm.get('brendCtrl').setValue('');
  }

  filterBrendOptions(value: string) {
    this.filteredBrends = [];
    this.unitsBrendOptions.brends.forEach(b => {
      if (b.brendname.includes(value) || value === '') {
        this.filteredBrends.push(b.brendname);
      }
    });
    this.unitsBrendOptions.brends.forEach(b => {
      if (b.brendname === value) {
        this.unitsModelOptions = b;
      }
    });
    this.selectForm.get('modelCtrl').setValue('');
  }

  filterModelOptions(value: string) {
    this.filteredModels = [];
    this.unitsModelOptions.models.forEach(m => {
      if (m.includes(value) || value === '') {
        this.filteredModels.push(m);
      }
    });
  }

  normalizeSpaces(event) {
    event.target.value = event.target.value
      .toString().replace(/\s+/g, ' ').trim();
  }

  onFirstStep() {
    this.submitted = true;
    if (this.selectForm.invalid) {
      return;
    }
    this.loading = true;
    this.unit.ouner = this.currentUser.id;
    this.unit.assignment = this.selectForm.get('assignmentCtrl').value;
    this.unit.type = this.selectForm.get('typeCtrl').value;
    this.unit.brand = this.selectForm.get('brendCtrl').value;
    this.unit.model = this.selectForm.get('modelCtrl').value;
    this.unit.location = this.currentUser.location;
    this.unit.enabled = true;
    this.unit.paid = false;
    this.parkService.createUnit(this.unit).pipe(first(),
      untilDestroyed(this)).subscribe(() => {
        this.loading = false;
      this.dialogRef.close();
      this.snackbarService.success('Единица техники успешно создана',
        'OK', 10000);
    },
      error => {
        this.loading = false;
        console.log(error);
        this.dialogRef.close();
        this.snackbarService.error('Что-то пошло не так', 'OK');
      });
    // this.parkService.createUnitTypesList(this.unitsList).pipe(first(),
    //   untilDestroyed(this)).subscribe(() => {
    //   console.log('unitsList created!');
    // });
  }
}
