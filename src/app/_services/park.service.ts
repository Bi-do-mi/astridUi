import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {finalize, first, map} from 'rxjs/operators';
import {UnitAssignment, UnitBrand, UnitType} from '../_model/UnitTypesModel';
import {Unit} from '../_model/Unit';
import {NgxSpinnerService} from 'ngx-spinner';
import {UserService} from './user.service';
import {Feature} from 'geojson';
import * as turf from '@turf/helpers';
import {BehaviorSubject} from 'rxjs';
import {User} from '../_model/User';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParkService implements OnDestroy {
  private unitsCacheFiltered$ = new BehaviorSubject<Array<Unit>>(new Array<Unit>());
  unitsCacheFiltered = this.unitsCacheFiltered$.asObservable();
  private units = new Map<number, Unit>();
  private usersCacheFiltered$ = new BehaviorSubject<Array<User>>(new Array<User>());
  usersCacheFiltered = this.usersCacheFiltered$.asObservable();
  private users = new Map<number, User>();

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private spinner: NgxSpinnerService,
  ) {
    this.getJSONfromFile();
  }

  ngOnDestroy() {
  }

  public getJSONfromFile(fromFile?: boolean) {
    const localUrl = './assets/ParkList/list.json';
    const url = + '/rest/units/get_unit_types_list';
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
    // console.log('createUnit: \n' + JSON.stringify(unit));
    return this.http.post<any>(+ '/rest/units/create_unit', unit)
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
    return this.http.post<any>(+ '/rest/units/update_unit', unit)
      .pipe(first(), finalize(() => {
          notFinished = false;
          this.spinner.hide();
        })
        , map((user: User) => {
          if (user) {
            // console.log('this.userService.updateCurrentUser!!!'
            //   + JSON.stringify(user.units[0].location));
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
    return this.http.post<any>(+ '/rest/units/delete_unit', unit)
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
    return this.http.post<any>(+ '/rest/units/create_unit_types_list', list)
      .pipe(first(), untilDestroyed(this), finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }));
  }

  loadDataOnMoveEnd(polygon: turf.Feature<turf.MultiPolygon>) {
    // todo при перемещении парка и выходе отобразится метка парка на старом месте. Починить.
    // todo удалить пробелы и большие буквы в адресе авторизации
    // console.log('loadDataOnMoveEnd^ \n' + JSON.stringify(polygon));
    this.http.post<any>(+ '/rest/search/on_moveend', polygon)
      .pipe(first(), untilDestroyed(this)).subscribe((data: Array<Array<any>>) => {
      if (data) {
        if (data[0].length > 0) {
          data[0].forEach((us: User) => {
            if (!this.users.has(us.id)) {
              this.users.set(us.id, us);
            }
          });
          this.usersCacheFiltered$.next(this.filterUsers());
        }
        if (data[1].length > 0) {
          data[1].forEach((u: Unit) => {
            if (!this.units.has(u.id)) {
              this.units.set(u.id, u);
            }
          });
          this.unitsCacheFiltered$.next(this.filterUnits());
        }
      }
    },
      error1 => {
        // console.log('loadDataOnMoveEnd ERROR: \n' + JSON.stringify(error1) + 'poly: \n'
        //   + JSON.stringify(polygon));
      });
  }

  filterUsers(): Array<User> {
    const users_ = new Map(this.users);
    this.userService.currentUser.pipe(first(), untilDestroyed(this)).subscribe(
      (user: User) => {
        if (this.users.size > 0 && user) {
          if (users_.has(user.id)) {
            users_.delete(user.id);
          }
        }
      });
    // console.log('filterUnits: \n' + units_.size);
    return Array.from(users_.values());
  }

  filterUnits(): Array<Unit> {
    const units_ = new Map(this.units);
    this.userService.currentUser.pipe(first(), untilDestroyed(this)).subscribe(
      (user: User) => {
        if (this.units.size > 0 && user.units && user.units.length > 0) {
          user.units.forEach((u: Unit) => {
            if (units_.has(u.id)) {
              units_.delete(u.id);
            }
          });
        }
      });
    // console.log('filterUnits: \n' + units_.size);
    return Array.from(units_.values());
  }

  loadUnitImgFromServer(unit: Unit) {
    return this.http.put<any>(+ '/rest/units/get_units_images', unit)
      .pipe(first(), untilDestroyed(this), map((data: Unit) => {
        if (this.units.has(data.id)) {
          this.units.set(data.id, data);
        }
        return data;
      }));
  }

  loadUsersImgFromServer(user: User) {
    return this.http.put<any>(+ '/rest/users/get_users_image', user)
      .pipe(first(), untilDestroyed(this), map((data: User) => {
        if (this.users.has(data.id)) {
          this.users.set(data.id, data);
        }
        return data;
      }));
  }
}
