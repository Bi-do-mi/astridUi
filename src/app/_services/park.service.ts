import {Injectable} from '@angular/core';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {finalize, first, map} from 'rxjs/operators';
import {UnitAssignment, UnitBrand, UnitType} from '../_model/UnitTypesModel';
import {Unit} from '../_model/Unit';
import {NgxSpinnerService} from 'ngx-spinner';
import {UserService} from './user.service';
import {Body} from '@angular/http/src/body';
import {untilDestroyed} from 'ngx-take-until-destroy';

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
    return this.http.get(fromFile ? localUrl : url).pipe(first(),
      map((data: UnitType[]) => {
        const allText: string = JSON.stringify(data);
        data = JSON.parse(allText);
        data.forEach(t => {
          t.brandsmap = new Map<string, UnitBrand>();
          t.brands.forEach((v) => {
            t.brandsmap.set(v.brandname, v);
          });
        });
        return data;
      }));
  }

  sortAssignment(a: UnitAssignment, b: UnitAssignment) {
    return (a.assignmentname > b.assignmentname) ? 1 :
      (a.assignmentname < b.assignmentname ? -1 : 0);
  }

  sortType(a: UnitType, b: UnitType) {
    return (a.typename > b.typename) ? 1 :
      (a.typename < b.typename ? -1 : 0);
  }

  sortBrand(a: UnitBrand, b: UnitBrand) {
    return (a.brandname > b.brandname) ? 1 :
      (a.brandname < b.brandname ? -1 : 0);
  }

  createUnit(unit: Unit) {
    // console.log('createUnit unit: ' + JSON.stringify(unit));
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.post<any>('rest/units/create_unit', unit)
      .pipe(first(), finalize(() => {
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

  updateUnit(unit: Unit) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.post<any>('rest/units/update_unit', unit)
      .pipe(first(), finalize(() => {
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

  deleteUnit(unit: Unit) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.post<any>('rest/units/delete_unit', unit)
      .pipe(first(), finalize(() => {
          notFinished = false;
          this.spinner.hide();
        })
        , map(user => {
          if (user) {
            this.userService.updateCurrentUser(user, true);
          }
          return user;
        })
      );
  }

  createUnitTypesList(list: Array<UnitType>) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.post<any>('rest/units/create_unit_types_list', list)
      .pipe(first(), finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }));
  }

}
