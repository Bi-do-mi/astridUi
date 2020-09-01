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
  public filteredUsers$ = new BehaviorSubject<Array<User>>(new Array<User>());
  public filteredUsers = this.filteredUsers$.asObservable();

  constructor(
    private parkService: ParkService
  ) {
    // привязка юзеров без зарегестрированного
    this.parkService.usersCacheFiltered.pipe(untilDestroyed(this))
      .subscribe((usersCache: Array<User>) => {
        this.usersCache = usersCache;
      });
    // привязка юнитов в поле без собственных
    this.parkService.unitsCacheFiltered.pipe(untilDestroyed(this))
      .subscribe((unitsCache: Array<Unit>) => {
        this.unitsCache = unitsCache;
      });
    // привязка юнитов в парке без собственных
    this.parkService.unitsInParkCacheFiltered.pipe(untilDestroyed(this))
      .subscribe((unitsInParkCache: Array<Unit>) => {
        this.unitsInParkCache = unitsInParkCache;
      });
  }

  ngOnDestroy() {
  }

  fillList(_query: string) {
    const query_ = _query.toUpperCase();
    this.filteredUsers$.next(new Array<User>());
    this.filteredAllUnits$.next(new Array<Unit>());

    if (!this.searchUnits) {
      this.filteredUsers$.next(this.usersCache.filter(u => {
        return (u.name.toUpperCase().includes(query_)
          || u.username.toUpperCase().includes(query_));
      }));
    } else {
      this.filteredAllUnits$.next([... this.unitsCache.filter(u => {
        return (u.type.toUpperCase().includes(query_)
        || u.brand.toUpperCase().includes(query_)
        || u.model.toUpperCase().includes(query_));
      }),
        ... this.unitsInParkCache.filter(u => {
        return (u.type.toUpperCase().includes(query_)
          || u.brand.toUpperCase().includes(query_)
          || u.model.toUpperCase().includes(query_));
      })
      ]);
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
}
