import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {finalize, first, map} from 'rxjs/operators';
import {UnitBrand, UnitType} from '../_model/UnitTypesModel';
import {Unit} from '../_model/Unit';
import {NgxSpinnerService} from 'ngx-spinner';
import {UserService} from './user.service';
import * as turf from '@turf/helpers';
import {BehaviorSubject} from 'rxjs';
import {User} from '../_model/User';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {DateDeserializerService} from './date-deserializer.service';
import {SnackBarService} from './snack-bar.service';
import {ZonedDateTime} from '@js-joda/core';
import {environment} from '../../environments/environment.prod';
import {Feature} from '@turf/helpers';
import {MultiPolygon} from '@turf/helpers';

@Injectable({
  providedIn: 'root'
})
export class ParkService implements OnDestroy {
  private ownUnitsCacheFiltered$ = new BehaviorSubject<Array<Unit>>(new Array<Unit>());
  private ownUnitsInParkCacheFiltered$ = new BehaviorSubject<Array<Unit>>(new Array<Unit>());
  private ownUnitsNotPaidCacheFiltered$ = new BehaviorSubject<Array<Unit>>(new Array<Unit>());
  private ownUnitsNotEnabledCacheFiltered$ = new BehaviorSubject<Array<Unit>>(new Array<Unit>());
  private unitsCacheFiltered$ = new BehaviorSubject<Array<Unit>>(new Array<Unit>());
  private unitsInParkCacheFiltered$ = new BehaviorSubject<Array<Unit>>(new Array<Unit>());

  ownUnitsCacheFiltered = this.ownUnitsCacheFiltered$.asObservable();
  ownUnitsInParkCacheFiltered = this.ownUnitsInParkCacheFiltered$.asObservable();
  ownUnitsNotPaidCacheFiltered = this.ownUnitsNotPaidCacheFiltered$.asObservable();
  ownUnitsNotEnabledCacheFiltered = this.ownUnitsNotEnabledCacheFiltered$.asObservable();
  unitsCacheFiltered = this.unitsCacheFiltered$.asObservable();
  unitsInParkCacheFiltered = this.unitsInParkCacheFiltered$.asObservable();

  // Own Units
  private ownUnits = new Map<number, Unit>();
  private ownUnitsInPark = new Map<number, Unit>();
  private ownUnitsNotPaid = new Map<number, Unit>();
  private ownUnitsNotEnabled = new Map<number, Unit>();
  // Units (not own)
  public units = new Map<number, Unit>();
  public unitsInPark = new Map<number, Unit>();
  // Users
  private usersCacheFiltered$ = new BehaviorSubject<Array<User>>(new Array<User>());
  usersCacheFiltered = this.usersCacheFiltered$.asObservable();
  private users = new Map<number, User>();
  // Empty Users
  private emptyUsersCacheFiltered$ = new BehaviorSubject<Array<User>>(new Array<User>());
  emptyUsersCacheFiltered = this.emptyUsersCacheFiltered$.asObservable();
  private emptyUsers = new Map<number, User>();
  private currentUser: User;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private dateDeserializer: DateDeserializerService,
    private snackbarService: SnackBarService
  ) {
    this.getJSONfromFile();
  }

  ngOnDestroy() {
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

  createUnit(unit: Unit) {
    // console.log('createUnit unit: ' + JSON.stringify(unit));
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    // console.log('createUnit: \n' + JSON.stringify(unit));
    return this.http.post<any>('/rest/units/create_unit', unit)
      .pipe(first(), finalize(() => {
          notFinished = false;
          this.spinner.hide();
        })
        , map((user: User) => {
          if (user) {
            this.dateDeserializer.date(user);
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
    return this.http.post<any>('/rest/units/update_unit', unit)
      .pipe(first(), finalize(() => {
          notFinished = false;
          this.spinner.hide();
        })
        , map((user: User) => {
          if (user) {
            this.dateDeserializer.date(user);
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
    return this.http.post<any>('/rest/units/delete_unit', unit)
      .pipe(first(), finalize(() => {
          notFinished = false;
          this.spinner.hide();
        })
        , map((user: User) => {
          this.dateDeserializer.date(user);
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
    return this.http.post<any>('/rest/units/create_unit_types_list', list)
      .pipe(first(), untilDestroyed(this), finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }));
  }

  ownUnitsSourcesRebuild(viewPort?: Feature<MultiPolygon>) {
    this.userService.currentUser.pipe(untilDestroyed(this), first()).subscribe((currentUser) => {
      this.currentUser = currentUser;
    });
    this.users.clear();
    this.ownUnits.clear();
    this.ownUnitsInPark.clear();
    this.ownUnitsNotEnabled.clear();
    this.ownUnitsNotPaid.clear();
    this.units.clear();
    this.unitsInPark.clear();

    if (this.currentUser && this.currentUser.units) {
      if (this.currentUser.units.length > 0) {
        this.currentUser.units.forEach(u => {
          if (u.workEnd && u.workEnd.isBefore(ZonedDateTime.now())) {
            this.recheckUserUnits();
          } else {
            if (u.enabled) {
              if ((environment.testing_paid ? true : u.paid)) {
                if (!this.locationComparer(this.currentUser, u)) {
                  this.ownUnits.set(u.id, u);
                } else {
                  this.ownUnitsInPark.set(u.id, u);
                }
              } else {
                this.locationComparer(this.currentUser, u)
                  ? this.ownUnitsInPark.set(u.id, u)
                  : this.ownUnitsNotPaid.set(u.id, u);
              }
            } else {
              this.ownUnitsNotEnabled.set(u.id, u);
            }
          }
        });
      }
    }
    this.ownUnitsCacheFiltered$.next(Array.from(this.ownUnits.values()));
    this.ownUnitsInParkCacheFiltered$.next(Array.from(this.ownUnitsInPark.values()));
    this.ownUnitsNotPaidCacheFiltered$.next(Array.from(this.ownUnitsNotPaid.values()));
    this.ownUnitsNotEnabledCacheFiltered$.next(Array.from(this.ownUnitsNotEnabled.values()));

    this.loadDataOnMoveEnd(viewPort);
  }

  loadDataOnMoveEnd(polygon: turf.Feature<turf.MultiPolygon>, full?: boolean) {
    if (document.cookie.indexOf('XSRF-TOKEN') === -1) {
      this.http.get<any>('/rest/users/hello')
        .pipe(first(), untilDestroyed(this), finalize(() => {
          this.users.clear();
          this.units.clear();
          this.unitsInPark.clear();
          this.ownUnitsSourcesRebuild();
          this.onMoveEndRequest(polygon);
        })).subscribe(() => {
      }, error1 => {
        // console.log('Error resived!');
      });
    } else {
      this.onMoveEndRequest(polygon, full);
    }
  }

  onMoveEndRequest(polygon: turf.Feature<turf.MultiPolygon>, full?: boolean) {
    if (polygon) {
      if (full) {
        this.ownUnitsSourcesRebuild();
      } else {
        this.http.post<any>('/rest/search/on_moveend', polygon)
          .pipe(first(), untilDestroyed(this)).subscribe((data: Array<Array<any>>) => {
            if (data) {
              if (data[0].length > 0) {
                const currUserId = this.currentUser ? this.currentUser.id : null;
                data[0].forEach((us: User) => {
                  if ((full || !this.users.has(us.id)) && us.enabled && (us.units.length > 0)) {
                    this.dateDeserializer.date(us);
                    if (us.id !== currUserId) {
                      this.users.set(us.id, us);
                    }
                  }
                });
                this.usersCacheFiltered$.next(Array.from(this.users.values()));
              }
              this.filterUnits(data[1], full);
            }

          },
          error1 => {
            // console.log('loadDataOnMoveEnd ERROR: \n' + JSON.stringify(error1) + 'poly: \n'
            //   + JSON.stringify(polygon));
          });
      }
    }
  }

  recheckOtherUnits(checkUnits: Array<number>) {
    // console.log('recheckUnits! ');
    this.http.post<any>('/rest/search/on_recheck_other_units', checkUnits)
      .pipe(first(), untilDestroyed(this)).subscribe((data: Array<Unit>) => {
      if (data && data.length > 0) {
        data.forEach(u => {
          this.dateDeserializer.date(u);
          this.filterUnits(data);
        });
      }
    });
  }

  recheckUserUnits() {
    // console.log('recheckUserUnits! ');
    this.http.get<any>('/rest/search/on_recheck_oun_units')
      .pipe(first(), untilDestroyed(this)).subscribe((user: User) => {
      if (user) {
        this.dateDeserializer.date(user);
        this.userService.updateCurrentUser(user, true);
      }
    });
  }

  filterUnits(data: Array<Unit>, full?: boolean) {
    if (data && data.length > 0) {
      const recheckUnits = new Array<number>();
      const currUserId = this.currentUser ? this.currentUser.id : null;
      data.forEach((u: Unit) => {
        if ((full || !(this.units.has(u.id) || this.unitsInPark.has(u.id))) && u.enabled
          && (u.ownerId !== currUserId) && (environment.testing_paid ? true : u.paid)) {
          this.dateDeserializer.date(u);
          if (u.workEnd && u.workEnd.isBefore(ZonedDateTime.now())) {
            recheckUnits.push(u.id);
          } else {
            if (u.workEnd) {
              this.units.set(u.id, u);
            } else {
              this.unitsInPark.set(u.id, u);
            }
          }
        }
      });
      if (recheckUnits.length > 0) {
        this.recheckOtherUnits(recheckUnits);
      }
      this.unitsCacheFiltered$.next(Array.from(this.units.values()));
      this.unitsInParkCacheFiltered$.next(Array.from(this.unitsInPark.values()));
    }
    if (full) {
      this.snackbarService.success('Данные карты обновлены', 'Ok', 5000);
    }
  }

  loadUnitImgFromServer(unit: Unit) {
    return this.http.put<any>('/rest/units/get_units_images', unit)
      .pipe(first(), untilDestroyed(this), map((data: Unit) => {
        this.dateDeserializer.date(data);
        if (this.units.has(data.id)) {
          this.units.set(data.id, data);
        }
        return data;
      }));
  }

  loadUsersImgFromServer(user: User) {
    return this.http.put<any>('/rest/users/get_users_image', user)
      .pipe(first(), untilDestroyed(this), map((data: User) => {
        this.dateDeserializer.date(user);
        if (this.users.has(data.id)) {
          this.users.set(data.id, data);
        }
        return data;
      }));
  }

  locationComparer(user: User, unit: Unit): boolean {
    try {
      return unit.location.geometry.coordinates[0] === user.location.geometry.coordinates[0] &&
        unit.location.geometry.coordinates[1] === user.location.geometry.coordinates[1];
    } catch (e) {
      console.log('Error in locationComparer\n', e);
    }
  }
}
