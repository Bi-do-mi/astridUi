import {AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UnitOptionDropdown, UnitOptionModel} from '../UnitOptions/UnitOptionModel';
import {FormGroup, Validators} from '@angular/forms';
import {QuestionControlService} from '../question-control.service';
import {QuestionService} from '../question.service';
import {finalize} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  unitOptions: UnitOptionModel<any>[] = [];
  optionsForm: FormGroup;
  extraOptions: UnitOptionModel<any>[] = [];
  selectExtraCtrl: UnitOptionDropdown;

  constructor(private qcs: QuestionControlService,
              private qs: QuestionService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.qs.unitOptions.pipe(untilDestroyed(this))
      .subscribe(options => {
        const tempOps: UnitOptionModel<any>[] = [];
        const ctrlOps: { key: string, value: string }[] = [];
        options.forEach(op => {
          if (op.unitType[0] === 'extra') {
            this.extraOptions.push(op);
            ctrlOps.push({key: op.label, value: op.label});
          } else {
            tempOps.push(op);
          }
        });
        // создание элемента дополнительных опций
        this.selectExtraCtrl = new UnitOptionDropdown({
          key: 'дополнительно',
          label: 'Дополнительно',
          required: false,
          controlType: 'select',
          unitType: ['extra'],
          options: ctrlOps
        });
        // добавление доп опций
        if (this.optionsForm &&
          this.optionsForm.controls[this.selectExtraCtrl.key]) {
          this.optionsForm.controls[this.selectExtraCtrl.key].valueChanges
            .pipe(untilDestroyed(this))
            .subscribe(value => {
              this.addOption(value);
            });
        }
        this.unitOptions = tempOps;
        this.cdr.detectChanges();
      });
    this.qcs.formGroup.pipe(untilDestroyed(this))
      .subscribe(fg => {
        this.optionsForm = fg;
        this.cdr.detectChanges();
      });
    // console.log('dynamic form ngIf - optionsForm: ' + JSON.stringify(this.optionsForm));
    // console.log('dynamic form ngIf - selectExtraCtrl: ' + JSON.stringify(this.selectExtraCtrl));
  }

  addOption(val: string) {
    this.extraOptions.forEach(extraOp => {
      if (extraOp.label === val) {
        this.unitOptions.push(extraOp);
      }
    });
  }

  ngOnDestroy() {
  }
}

