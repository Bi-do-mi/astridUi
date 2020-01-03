import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchService} from '../../_services/search.service';
import {FormControl} from '@angular/forms';
import {User} from '../../_model/User';
import {Unit} from '../../_model/Unit';
import {debounceTime, delay, first, map} from 'rxjs/operators';
import {FilteredUnitsListTableComponent} from '../filtered-units-list-table/filtered-units-list-table.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  modelCtrl = new FormControl();
  modelOptions = new Array<Unit>();
  userCtrl = new FormControl();
  FilteredUnitsListTableComponent = FilteredUnitsListTableComponent;
  showFiltUnList = false;

  constructor(
    public searchService: SearchService) {
    // фильтрация имен юнитов по поисковой строке
    // применить бихейвер
    this.modelCtrl.valueChanges
      .pipe(debounceTime(500),
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
    this.searchService.filteredUsers = this.userCtrl.valueChanges
      .pipe(
        map((state: string) => state ?
          this.simplifyUsersArr(this._filterUsers(state))
          : this.simplifyUsersArr(this.searchService.usersCache.slice()))
      );
  }

  ngOnInit() {
    // this.searchService.filteredUnits.subscribe((units: Array<Unit>) => {
    //   this.showFiltUnList = !!units.length;
    // });
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
