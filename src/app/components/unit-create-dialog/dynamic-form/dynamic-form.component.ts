import {AfterViewInit, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {UnitOptionModel} from '../UnitOptions/UnitOptionModel';
import {FormGroup, Validators} from '@angular/forms';
import {QuestionControlService} from '../question-control.service';
import {QuestionService} from '../question.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, AfterViewInit {
  unitOptions: UnitOptionModel<any>[] = [];
  optionsForm: FormGroup;

  constructor(private qcs: QuestionControlService,
              private qs: QuestionService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.qs.unitOptions.subscribe(options => {
      this.unitOptions = options;
      this.cdr.detectChanges();
    });
    this.qcs.formGroup.subscribe(fg => {
      this.optionsForm = fg;
      this.cdr.detectChanges();
      Object.keys(this.optionsForm.controls).forEach(key => {
        console.log(this.optionsForm.controls[key].valid);
      });
    });
  }
}
