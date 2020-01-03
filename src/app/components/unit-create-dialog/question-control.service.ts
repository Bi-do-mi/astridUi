import {Injectable} from '@angular/core';
import {UnitOptionModel} from './UnitOptions/UnitOptionModel';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, ReplaySubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionControlService {
  private formGroup$ = new ReplaySubject<any>();
  formGroup = this.formGroup$.asObservable();

  constructor() {
  }

  toFormGroup(questions: UnitOptionModel<any>[]) {
    const group: any = {};
    questions.forEach(question => {
      const fc: FormControl = new FormControl(question.value || '');
      const array = [];
      if (question.required) {
        array.push(Validators.required);
      }
      if (question.controlType === 'number') {
        array.push(Validators.pattern(/^\d+(\.\d+)*$/));
        array.push(Validators.maxLength(7));
      }
      if (question.controlType === 'text') {
        array.push(Validators.maxLength(20));
      }
      fc.setValidators(array);
      fc.updateValueAndValidity();
      group[question.key] = fc;
    });
    group['дополнительно'] = new FormControl('');
    // console.log('toFormGroup: \n' + JSON.stringify(group));
    this.formGroup$.next(new FormGroup(group));
  }
}
