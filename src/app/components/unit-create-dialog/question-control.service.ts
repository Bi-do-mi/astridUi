import {Injectable} from '@angular/core';
import {UnitOptionModel} from './UnitOptions/UnitOptionModel';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionControlService {
  private formGroup$ = new Subject<any>();
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
        array.push(Validators.pattern(/^\d+$/));
      }
      fc.setValidators(array);
      fc.updateValueAndValidity();
      group[question.key] = fc;
    });
    this.formGroup$.next(new FormGroup(group));
  }
}
