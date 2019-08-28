import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Unit} from '../_model/Unit';

@Injectable({
  providedIn: 'root'
})
export class SetLocationCallService {
  private setLocation$ = new Subject();
  setLocation = this.setLocation$.asObservable();

  constructor() {
  }

  set(openCreateUnitDialog: boolean, unit: Unit, stepNum: number) {
    this.setLocation$.next({openCreateUnitDialog, unit, stepNum});
  }
}
