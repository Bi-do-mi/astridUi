import {Injectable} from '@angular/core';
import {ZonedDateTime} from '@js-joda/core';
import {User} from '../_model/User';
import {Unit} from '../_model/Unit';

@Injectable({
  providedIn: 'root'
})
export class DateDeserializerService {

  constructor() {
  }

  public date(inc: any) {

    if (inc && inc.registrationDate) {
      inc.registrationDate = ZonedDateTime.parse(inc.registrationDate.toString());
      inc.lastVisit = ZonedDateTime.parse(inc.lastVisit.toString());
      if ((<User>inc).units.length > 0) {
        (<User>inc).units.forEach(unit => {
          this.setUnitDate(unit);
        });
      }
      return inc;
    }
    if (inc && inc.createdOn) {
      return this.setUnitDate(inc);
    }
  }

  private setUnitDate(unit: Unit) {
    if (unit.createdOn) {
      unit.createdOn = ZonedDateTime.parse(unit.createdOn.toString());
    }
    if (unit.lastUpdate) {
      unit.lastUpdate = ZonedDateTime.parse(unit.lastUpdate.toString());
    }
    if (unit.workEnd) {
      unit.workEnd = ZonedDateTime.parse(unit.workEnd.toString());
    }
    return unit;
  }
}
