import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {UnitOptionModel} from '../UnitOptions/UnitOptionModel';
import {QuestionService} from '../question.service';

@Component({
  selector: 'app-dynamic-form-question',
  templateUrl: './dynamic-form-question.component.html',
  styleUrls: ['./dynamic-form-question.component.scss']
})
export class DynamicFormQuestionComponent implements OnInit {
  @Input() question: UnitOptionModel<any>;
  @Input() form: FormGroup;

  constructor(
    private qs: QuestionService,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.form.controls[this.question.key].valueChanges.subscribe(value => {
      this.cdr.detectChanges();
    });
  }
}
