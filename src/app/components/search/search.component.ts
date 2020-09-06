import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SearchService} from '../../_services/search.service';
import {FormControl} from '@angular/forms';
import {User} from '../../_model/User';
import {debounceTime, map} from 'rxjs/operators';
import {FilteredUnitsListTableComponent} from '../filtered-units-list-table/filtered-units-list-table.component';
import {FilteredUsersListTableComponent} from '../filtered-users-list-table/filtered-users-list-table.component';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  searchCtrl = new FormControl();
  searchOptions = new Array<string>();
  modelCtrl = new FormControl();
  FilteredUnitsListTableComponent = FilteredUnitsListTableComponent;
  FilteredUsersListTableComponent = FilteredUsersListTableComponent;
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  constructor(
    public searchService: SearchService) {

    // фильтрация по поисковой строке
    this.searchCtrl.valueChanges.pipe(debounceTime(500), untilDestroyed(this),
      map((state: string) => {
        const searchResults: Array<string>
          = [... this.searchService.mainFilter(state)];
        // this.showFiltUnList = false;
        // this.showFiltUsList = false;
        if (searchResults.length) {
          if (this.searchService.searchUnits) {
            // this.showFiltUnList = true;
          }
          if (!this.searchService.searchUnits) {
            // this.showFiltUsList = true;
          }
        }
        return state ? searchResults : new Array<string>();
      })
    ).subscribe((options: Array<string>) => {
      this.searchOptions = options;
    });
  }

  ngOnInit() {
    this.searchCtrl.setValue(this.searchService.searchQuery);
    // if (this.searchService.searchQuery) {
    //   this.search();
    // }
  }

  ngOnDestroy() {
  }

  search() {
      this.autocomplete.closePanel();
      this.searchService.fillSearchResListWithIsThereResTriggering(this.searchCtrl.value);
    }
}
