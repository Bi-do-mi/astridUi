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
  // filter elements:
  public wordKeyFilteredAllUnits = new Array<Unit>();
  public wordKeyFilteredUnitsForMap = new Array<Unit>();
  public unitTypeFilterOption = new Map<string, [boolean, boolean]>();
  public unitBrandFilterOption = new Map<string, [boolean, boolean]>();
  public unitModelFilterOption = new Map<string, [boolean, boolean]>();

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
    // console.log('_query: ', _query);
    // console.log('this.searchQuery: ', this.searchQuery);
    if ((this.searchQuery !== _query)) {
      this.clearFilterOptions();
      this.filteredUsers$.next(new Array<User>());
      this.filteredAllUnits$.next(new Array<Unit>());
      this.filteredUnitsForMap$.next(new Array<Unit>());
    }
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
        this.wordKeyFilteredAllUnits = [...responseUnitsList];
        this.wordKeyFilteredUnitsForMap = [...unitsArrayForMap];
        // this.setFilterOptionsByType(this.filterByOptions([...responseUnitsList,
        //   ...unitsArrayForMap]));
        this.filteredAllUnits$.next(this.filterByOptions(responseUnitsList));
        this.filteredUnitsForMap$.next(this.filterByOptions(unitsArrayForMap));
        this.filteredUsers$.next(responseUsersList);
      }
    }
    if (this.isThereResult !== undefined) {
      this.isThereResult = (((responseUsersList !== undefined) && responseUsersList.length > 0)
        || ((responseUnitsList !== undefined) && responseUnitsList.length > 0));
    }
    this.searchQuery = _query;
  }

  // retrive options from filtered items to fill input options list
  mainOptionsFilter(query_: string): Array<string> {
    // this.searchQuery = query_;
    return this.searchUnits ? this.filterUnitsOptions(query_.toUpperCase())
      : this.filterUsersOptions(query_.toUpperCase());
  }

  filterUsersOptions(query_: string): Array<string> {
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

  filterUnitsOptions(query_: string): Array<string> {
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
    if (this.searchQuery) {
      this.mainOptionsFilter(this.searchQuery);
      this.fillSearchResList(this.searchQuery);
    }
  }

  clearFilterOptions() {
    this.wordKeyFilteredAllUnits.splice(0);
    this.wordKeyFilteredUnitsForMap.splice(0);
    this.unitTypeFilterOption.clear();
    this.unitBrandFilterOption.clear();
    this.unitModelFilterOption.clear();
  }

  initFilterOptions() {
    if (this.searchUnits) {
      if (this.wordKeyFilteredAllUnits.length > 0) {
        this.wordKeyFilteredAllUnits.forEach((unit: Unit) => {
          if (!this.unitTypeFilterOption.has(unit.type)) {
            this.unitTypeFilterOption.set(unit.type, [false, false]);
          }
          if (!this.unitBrandFilterOption.has(unit.brand)) {
            this.unitBrandFilterOption.set(unit.brand, [false, false]);
          }
          if (!this.unitModelFilterOption.has(unit.model)) {
            this.unitModelFilterOption.set(unit.model, [false, false]);
          }
        });
      }
      if (this.wordKeyFilteredUnitsForMap.length > 0) {
        this.wordKeyFilteredUnitsForMap.forEach(unit => {
          if (!this.unitTypeFilterOption.has(unit.type)) {
            this.unitTypeFilterOption.set(unit.type, [false, false]);
          }
          if (!this.unitBrandFilterOption.has(unit.brand)) {
            this.unitBrandFilterOption.set(unit.brand, [false, false]);
          }
          if (!this.unitModelFilterOption.has(unit.model)) {
            this.unitModelFilterOption.set(unit.model, [false, false]);
          }
        });
      }
    }
  }

  setFilterOptionsByType() {
    const allUnits: Array<Unit> = [...this.wordKeyFilteredAllUnits]
      .filter(unit => {
        return this.unitTypeFilterOption.get(unit.type)[0]
          || ([...this.unitTypeFilterOption.values()].map(v => v[0]).every(v => !v)
            && (this.unitBrandFilterOption.get(unit.brand)[0] || this.unitModelFilterOption.get(unit.model)[0]))
          || this.isFiltListClear();
      });
    [...this.unitBrandFilterOption.entries()].forEach((v, i, a) => {
      this.unitBrandFilterOption.get(v[0])[1] = !(allUnits.map(u => u.brand).indexOf(v[0]) >= 0);
    });
    [...this.unitModelFilterOption.entries()].forEach((v, i, a) => {
      this.unitModelFilterOption.get(v[0])[1] = !(allUnits.map(u => u.model).indexOf(v[0]) >= 0);
    });
    if (allUnits.every(un => this.unitTypeFilterOption.get(un.type)[1]) || this.isFiltListClear()) {
      [...this.unitTypeFilterOption.entries()].forEach((v, i, a) => {
        this.unitTypeFilterOption.get(v[0])[1] = !(allUnits.map(u => u.type).indexOf(v[0]) >= 0);
      });
    }
    this.filteredAllUnits$.next(allUnits);
    this.filteredUnitsForMap$.next(allUnits.filter(unit => (this.wordKeyFilteredUnitsForMap.indexOf(unit)) >= 0));
  }

  setFilterOptionsByBrand() {
    const allUnits: Array<Unit> = [...this.wordKeyFilteredAllUnits]
      .filter(unit => {
        return this.unitBrandFilterOption.get(unit.brand)[0]
          || ([...this.unitBrandFilterOption.values()].map(v => v[0]).every(v => !v)
            && (this.unitTypeFilterOption.get(unit.type)[0] || this.unitModelFilterOption.get(unit.model)[0]))
          || this.isFiltListClear();
      });
    [...this.unitTypeFilterOption.entries()].forEach((v, i, a) => {
      this.unitTypeFilterOption.get(v[0])[1] = !(allUnits.map(u => u.type).indexOf(v[0]) >= 0);
    });
    [...this.unitModelFilterOption.entries()].forEach((v, i, a) => {
      this.unitModelFilterOption.get(v[0])[1] = !(allUnits.map(u => u.model).indexOf(v[0]) >= 0);
    });
    if (allUnits.every(un => this.unitBrandFilterOption.get(un.brand)[1]) || this.isFiltListClear()) {
      [...this.unitBrandFilterOption.entries()].forEach((v, i, a) => {
        this.unitBrandFilterOption.get(v[0])[1] = !(allUnits.map(u => u.brand).indexOf(v[0]) >= 0);
      });
    }
    this.filteredAllUnits$.next(allUnits);
    this.filteredUnitsForMap$.next(allUnits.filter(unit => (this.wordKeyFilteredUnitsForMap.indexOf(unit)) >= 0));
  }

  setFilterOptionsByModel() {
    const allUnits: Array<Unit> = [...this.wordKeyFilteredAllUnits]
      .filter(unit => {
        return this.unitModelFilterOption.get(unit.model)[0]
          || ([...this.unitModelFilterOption.values()].map(v => v[0]).every(v => !v)
            && (this.unitTypeFilterOption.get(unit.type)[0] || this.unitBrandFilterOption.get(unit.brand)[0]))
          || this.isFiltListClear();
      });
    [...this.unitTypeFilterOption.entries()].forEach((v, i, a) => {
      this.unitTypeFilterOption.get(v[0])[1] = !(allUnits.map(u => u.type).indexOf(v[0]) >= 0);
    });
    [...this.unitBrandFilterOption.entries()].forEach((v, i, a) => {
      this.unitBrandFilterOption.get(v[0])[1] = !(allUnits.map(u => u.brand).indexOf(v[0]) >= 0);
    });
    if (allUnits.every(un => this.unitModelFilterOption.get(un.model)[1]) || this.isFiltListClear()) {
      [...this.unitModelFilterOption.entries()].forEach((v, i, a) => {
        this.unitModelFilterOption.get(v[0])[1] = !(allUnits.map(u => u.model).indexOf(v[0]) >= 0);
      });
    }
    this.filteredAllUnits$.next(allUnits);
    this.filteredUnitsForMap$.next(allUnits.filter(unit => (this.wordKeyFilteredUnitsForMap.indexOf(unit)) >= 0));
  }

  isFiltListClear() {
    return ([...this.unitTypeFilterOption.values()].map(v => v[0]).every(v => !v)
      && [...this.unitBrandFilterOption.values()].map(v => v[0]).every(v => !v)
      && [...this.unitModelFilterOption.values()].map(v => v[0]).every(v => !v));
  }

  filterByOptions(array: Array<Unit>): Array<Unit> {
    let result = new Array<Unit>();
    if (this.unitTypeFilterOption.size > 1
      && (![... this.unitTypeFilterOption.values()].every(v => v[0]))
      || this.unitBrandFilterOption.size > 1
      && (![... this.unitBrandFilterOption.values()].every(v => v[0]))
      || this.unitModelFilterOption.size > 1
      && (![... this.unitModelFilterOption.values()].every(v => v[0]))
    ) {
      result = array.filter((unit, index, arr) => {
        return ((this.unitTypeFilterOption.has(unit.type) && this.unitTypeFilterOption.get(unit.type)[0])
          || (this.unitBrandFilterOption.has(unit.brand) && this.unitBrandFilterOption.get(unit.brand)[0])
          || (this.unitModelFilterOption.has(unit.model) && this.unitModelFilterOption.get(unit.model)[0]))
          ? true : false;
      });
      return result.length > 0 ? result : array;
    } else {
      return array;
    }
  }
}
