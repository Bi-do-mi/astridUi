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
  public usersCache = new Array<User>();
  public unitsCache = new Array<Unit>();
  public filteredUnits$ = new BehaviorSubject<Array<Unit>>(new Array<Unit>());
  public filteredUnits = this.filteredUnits$.asObservable();
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
    // привязка юнитов без собственных
    this.parkService.unitsCacheFiltered.pipe(untilDestroyed(this))
      .subscribe((unitsCache: Array<Unit>) => {
        this.unitsCache = unitsCache;
      });
  }

  ngOnDestroy() {
  }
}
