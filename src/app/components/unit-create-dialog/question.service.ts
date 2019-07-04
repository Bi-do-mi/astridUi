import {Injectable} from '@angular/core';
import {UNIT_OPTIONS_CONSTANTS} from '../../constants/UnitOptionsConstants';
import {UnitOptionDropdown, UnitOptionModel, UnitOptionNumberbox, UnitOptionTextbox} from './UnitOptions/UnitOptionModel';
import {BehaviorSubject, Subject} from 'rxjs';
import {QuestionControlService} from './question-control.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private unitOptions$ = new Subject<UnitOptionModel<any>[]>();
  unitOptions = this.unitOptions$.asObservable();

  constructor(private questionCtrlService: QuestionControlService) {
  }

  getQuestions(selectedUnitType: string) {
    const _unitOptions = new Array<UnitOptionModel<any>>();
    UNIT_OPTIONS_CONSTANTS.forEach(op => {
      if (op.unitType.includes(selectedUnitType) ||
        op.unitType.includes('all')) {
        switch (op.controlType) {
          case 'text': {
            op.key = op.key.replace(/\s+/g, '_').toLowerCase();
            _unitOptions.push(new UnitOptionTextbox(op));
            break;
          }
          case 'number': {
            op.key = op.key.replace(/\s+/g, '_').toLowerCase();
            _unitOptions.push(new UnitOptionNumberbox(op));
            break;
          }
          case 'select': {
            op.key = op.key.replace(/\s+/g, '_').toLowerCase();
            _unitOptions.push(new UnitOptionDropdown(op));
            break;
          }
        }
      }
    });
    this.questionCtrlService.toFormGroup(_unitOptions);
    this.unitOptions$.next(_unitOptions.sort((a, b) => {
        return a.label > b.label ? 1 : (a.label < b.label ? -1 : 0);
      })
    );
  }
}
