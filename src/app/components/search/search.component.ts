import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchService} from '../../_services/search.service';
import {FormControl} from '@angular/forms';
import {User} from '../../_model/User';
import {Unit} from '../../_model/Unit';
import {debounceTime, delay, first, map} from 'rxjs/operators';
import {FilteredUnitsListTableComponent} from '../filtered-units-list-table/filtered-units-list-table.component';
import {FilteredUsersListTableComponent} from '../filtered-users-list-table/filtered-users-list-table.component';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  modelCtrl = new FormControl();
  modelOptions = new Array<Unit>();
  userCtrl = new FormControl();
  userOptions = new Array<User>();
  FilteredUnitsListTableComponent = FilteredUnitsListTableComponent;
  FilteredUsersListTableComponent = FilteredUsersListTableComponent;
  showFiltUnList = false;
  showFiltUsList = false;

  constructor(
    public searchService: SearchService) {
    // фильтрация имен юнитов по поисковой строке
    // применить бихейвер
    this.modelCtrl.valueChanges.pipe(debounceTime(500), untilDestroyed(this),
      map((state: string) => {
        const modelNames: Array<Unit> = (this._filterModels(state));
        modelNames.length
          ? this.showFiltUnList = true : this.showFiltUnList = false;
        return state ? modelNames
          : (this.searchService.unitsCache.slice());
      })
    ).subscribe((units: Array<Unit>) => {
      this.modelOptions = this.simplifyUnitsArr(units);
      this.searchService.filteredUnits$.next(units);
    });
    // фильтрация имен юзеров по поисковой строке
    this.userCtrl.valueChanges.pipe(debounceTime(500), untilDestroyed(this),
      map((state: string) => {
        const userNames: Array<User> = (this._filterUsers(state));
        userNames.length
          ? this.showFiltUsList = true : this.showFiltUsList = false;
        return state ? userNames
          : (this.searchService.usersCache.slice());
      })
    ).subscribe((users: Array<User>) => {
      // console.log('users: ' + JSON.stringify(users));
      this.userOptions = this.simplifyUsersArr(users);
      this.searchService.filteredUsers$.next(users);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  private _filterModels(value: string): Array<Unit> {
    const filterValue = value.toUpperCase();

    return this.searchService.unitsCache.filter((unit: Unit) => {
      return unit.model.toUpperCase().indexOf(filterValue) === 0;
    });
  }

  private _filterUsers(value: string): Array<User> {
    const filterValue = value.toUpperCase();

    return this.searchService.usersCache.filter((user: User) => {
      return user.name.toUpperCase().indexOf(filterValue) === 0;
    });
  }

  private simplifyUnitsArr(arr: Array<Unit>): Array<Unit> {
    const modelNames: Array<string> = [];
    return arr.filter((unit: Unit) => {
      if (!modelNames.includes(unit.model)) {
        modelNames.push(unit.model);
        return true;
      }
      return false;
    });
  }

  private simplifyUsersArr(arr: Array<User>): Array<User> {
    const ownerNames: Array<string> = [];
    return arr.filter((user: User) => {
      if (!ownerNames.includes(user.name)) {
        ownerNames.push(user.name);
        return true;
      }
      return false;
    });
  }
}
