import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {ParkService} from './park.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {User} from '../_model/User';
import {Unit} from '../_model/Unit';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {UnitDataSource} from '../_model/UnitDataSource';

@Injectable({
  providedIn: 'root'
})
export class SearchService implements OnDestroy {

  public searchUnits = true;
  public searchQuery = '';
  public searchTypes: string[] = ['поиск в текущем виде', 'поиск с масштабированием', 'глобальный поиск'];
  public searchType = 'поиск в текущем виде';
  public usersCache = new Array<User>();
  public unitsCache = new Array<Unit>();
  public unitsInParkCache = new Array<Unit>();
  public filteredAllUnits$ = new BehaviorSubject<Array<Unit>>(new Array<Unit>());
  public filteredAllUnits = this.filteredAllUnits$.asObservable();
  public filteredUnitsForMap$ = new BehaviorSubject<Array<Unit>>(new Array<Unit>());
  public filteredUnitsForMap = this.filteredUnitsForMap$.asObservable();
  public filteredUsers$ = new BehaviorSubject<Array<User>>(new Array<User>());
  public filteredUsers = this.filteredUsers$.asObservable();
  isThereResult: boolean;
  public searchProcess$ = new BehaviorSubject<boolean>(true);
  public searchProcess = this.searchProcess$.asObservable();

  constructor(
    private parkService: ParkService
  ) {
    // привязка юзеров без зарегестрированного
    this.parkService.usersCacheFiltered.pipe(untilDestroyed(this))
      .subscribe((usersCache: Array<User>) => {
        this.usersCache = usersCache;
        this.reSearch();
      });
    // привязка юнитов в поле без собственных
    this.parkService.unitsCacheFiltered.pipe(untilDestroyed(this))
      .subscribe((unitsCache: Array<Unit>) => {
        this.unitsCache = unitsCache;
        this.reSearch();
      });
    // привязка юнитов в парке без собственных
    this.parkService.unitsInParkCacheFiltered.pipe(untilDestroyed(this))
      .subscribe((unitsInParkCache: Array<Unit>) => {
        this.unitsInParkCache = unitsInParkCache;
        this.reSearch();
      });
  }

  ngOnDestroy() {
  }

  fillSearchResListWithIsThereResTriggering(q?: string) {
    // console.log('fillSearchResListWithIsThereResTriggering');
    if (this.isThereResult === undefined) {
      this.isThereResult = false;
    }
    this.fillSearchResList(q);
  }

  fillSearchResList(_query?: string) {
    // console.log('fillSearchResList');
    this.filteredUsers$.next(new Array<User>());
    this.filteredAllUnits$.next(new Array<Unit>());
    this.filteredUnitsForMap$.next(new Array<Unit>());
    let responseUsersList = new Array<User>();
    let responseUnitsList = new Array<Unit>();

    if (_query) {
      const query_ = _query.toUpperCase();
      if (!this.searchUnits) {
        // фильтрация владельцев
        responseUsersList = this.usersCache.filter(u => {
          return (u.name.toUpperCase().includes(query_)
            || u.username.toUpperCase().includes(query_));
        });
        this.filteredUsers$.next(responseUsersList);
      } else {
        // фильтрация юнитов
        const unitsMap = new Map<number, Array<number>>();
        let unitsArrayForMap = [... this.unitsInParkCache.filter(u => {
          if (u.type.toUpperCase().includes(query_)
            || u.brand.toUpperCase().includes(query_)
            || u.model.toUpperCase().includes(query_)) {
            unitsMap.has(u.ownerId) ?
              unitsMap.get(u.ownerId).push(u.id) :
              unitsMap.set(u.ownerId, [u.id]);
            return true;
          } else {
            return false;
          }
        })];
        responseUnitsList = [... this.unitsCache.filter(u => {
          return (u.type.toUpperCase().includes(query_)
            || u.brand.toUpperCase().includes(query_)
            || u.model.toUpperCase().includes(query_));
        }),
          ...unitsArrayForMap
        ];
        unitsMap.forEach((unitsArr, userId, m) => {
          if (unitsArr.length > 1) {
            unitsArr.forEach(uId => {
              unitsArrayForMap = unitsArrayForMap.filter(unit => unit.id !== uId);
            });
            this.usersCache.forEach(user => {
              if (user.id === userId) {
                responseUsersList.push(user);
              }
            });
          }
        });
        unitsArrayForMap = [... this.unitsCache.filter(u => {
          return (u.type.toUpperCase().includes(query_)
            || u.brand.toUpperCase().includes(query_)
            || u.model.toUpperCase().includes(query_));
        }),
          ...unitsArrayForMap];
        this.filteredAllUnits$.next(responseUnitsList);
        this.filteredUnitsForMap$.next(unitsArrayForMap);
        this.filteredUsers$.next(responseUsersList);
      }
    }
    if (this.isThereResult !== undefined) {
      this.isThereResult = (((responseUsersList !== undefined) && responseUsersList.length > 0)
        || ((responseUnitsList !== undefined) && responseUnitsList.length > 0));
      // if (_query && (this.searchType === this.searchTypes[1])) {
      //   this.searchProcess$.next(this.isThereResult);
      // }
    }
  }

  mainFilter(query_: string): Array<string> {
    this.searchQuery = query_;
    return this.searchUnits ? this.filterUnits(query_.toUpperCase())
      : this.filterUsers(query_.toUpperCase());
  }

  filterUsers(query_: string): Array<string> {
    const response: Array<string> = [];
    this.usersCache.forEach(u => {
      if (u.name.toUpperCase().includes(query_)) {
        response.push(u.name);
      }
      if (u.username.toUpperCase().includes(query_)) {
        response.push(u.username);
      }
    });
    return response;
  }

  filterUnits(query_: string): Array<string> {
    const response: Array<string> = [];
    this.unitsCache.filter(u => {
      if (u.type.toUpperCase().includes(query_)) {
        response.push(u.type);
      }
      if (u.brand.toUpperCase().includes(query_)) {
        response.push(u.brand);
      }
      if (u.model.toUpperCase().includes(query_)) {
        response.push(u.model);
      }
    });
    this.unitsInParkCache.filter(u => {
      if (u.type.toUpperCase().includes(query_)) {
        response.push(u.type);
      }
      if (u.brand.toUpperCase().includes(query_)) {
        response.push(u.brand);
      }
      if (u.model.toUpperCase().includes(query_)) {
        response.push(u.model);
      }
    });
    return response;
  }

  reSearch() {
    // console.log('reSearch');
    this.filterUnits(this.searchQuery);
    this.fillSearchResList(this.searchQuery);
  }
}
