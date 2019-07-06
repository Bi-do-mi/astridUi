import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {UnitOptionDropdown, UnitOptionModel} from '../UnitOptions/UnitOptionModel';
import {QuestionService} from '../question.service';
import {untilDestroyed} from 'ngx-take-until-destroy';

@Component({
  selector: 'app-dynamic-form-question',
  templateUrl: './dynamic-form-question.component.html',
  styleUrls: ['./dynamic-form-question.component.scss']
})
export class DynamicFormQuestionComponent implements OnInit, OnDestroy {
  @Input() question: UnitOptionModel<any>;
  @Input() form: FormGroup;

  constructor(
    private qs: QuestionService,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.form.controls[this.question.key].valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(value => {
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
  }
}
