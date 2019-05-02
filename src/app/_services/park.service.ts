import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {finalize, first, map} from 'rxjs/operators';
import {UnitAssignment} from '../_model/UnitTypesModel';
import {Unit} from '../_model/Unit';
import {NgxSpinnerService} from 'ngx-spinner';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ParkService {

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private spinner: NgxSpinnerService,
  ) {
    this.getJSONfromFile();
  }

  public getJSONfromFile(fromFile?: boolean) {
    const localUrl = './assets/ParkList/list.json';
    const url = '/rest/units/get_unit_types_list';
    return this.http.get(fromFile ? localUrl : url).pipe(
      map(data => {
        const allText: string = JSON.stringify(data);
        return data = JSON.parse(allText);
      }));
  }

  createUnit(unit: Unit) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.post<any>('rest/units/create_unit', unit)
      .pipe(finalize(() => {
          notFinished = false;
          this.spinner.hide();
        })
        , map(user => {
          if (user) {
            this.userService.updateCurrentUser(user, true);
          }
          return;
        })
      );
  }

  createUnitTypesList(list: Array<UnitAssignment>) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.post<any>('rest/units/create_unit_types_list', list)
      .pipe(finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }));
  }
}
