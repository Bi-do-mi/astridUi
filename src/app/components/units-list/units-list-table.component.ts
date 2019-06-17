import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../_services/user.service';
import {map} from 'rxjs/operators';
import {Unit} from '../../_model/Unit';
import {DataSource} from '@angular/cdk/collections';
import {merge, Observable} from 'rxjs';
import {MatPaginator, MatSort} from '@angular/material';

@Component({
  selector: 'app-units-list',
  templateUrl: './units-list-table.component.html',
  styleUrls: ['./units-list-table.component.scss']
})
export class UnitsListTableComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: UnitDataSource;
  displayedColumns: string[] = ['model'];

  constructor(public userService: UserService) {
  }

  ngOnInit() {
    this.dataSource = new UnitDataSource(this.paginator, this.sort, this.userService);
  }

  ngOnDestroy() {
  }

  setUnitLocation() {
    console.log('\nsetUnitLocation() triggered!');
  }
}

//
//
//
//  Data Source Class    //////////////////////////////////////////////////////////////////////
export class UnitDataSource extends DataSource<Unit> {
  data: Unit[];

  constructor(
    private paginator: MatPaginator,
    private sort: MatSort,
    private userService: UserService) {
    super();
    this.userService.currentUserUnits.subscribe(u => this.data = u);
  }

  connect(): Observable<Unit[]> {
    const dataMutations = [
      this.userService.currentUserUnits,
      this.paginator.page,
      this.sort.sortChange
    ];
    this.userService.currentUserUnits.subscribe(u => {
      this.paginator.length = this.data.length;
    });
    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  disconnect() {
  }

  private getPagedData(data: Unit[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  private getSortedData(data: Unit[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'model':
          return this.compare(a.model, b.model, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? -1 : 1);
  }
}

