
//  Data Source Class    //////////////////////////////////////////////////////////////////////
import {DataSource} from '@angular/cdk/table';
import {Unit} from './Unit';
import {OnDestroy} from '@angular/core';
import {merge, Observable, Subscription} from 'rxjs';
import {MatPaginator, MatSort} from '@angular/material';
import {UserService} from '../_services/user.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {map} from 'rxjs/operators';

export class UnitDataSource extends DataSource<Unit> implements OnDestroy {
  data: Unit[];
  private subscription1: Subscription;
  private subscription2: Subscription;

  constructor(
    private paginator: MatPaginator,
    private sort: MatSort,
    private userService: UserService) {
    super();
    this.subscription1 = this.userService.currentUserUnits
      .pipe(untilDestroyed(this)).subscribe(u => this.data = u);
  }

  ngOnDestroy() {
  }

  connect(): Observable<Unit[]> {
    const dataMutations = [
      this.userService.currentUserUnits,
      this.paginator.page,
      this.sort.sortChange
    ];
    this.subscription2 = this.userService.currentUserUnits.pipe(untilDestroyed(this))
      .subscribe(u => {
        if (u) {
          this.paginator.length = this.data.length;
        }
      });
    return merge(...dataMutations).pipe(map(() => {
      if (this.data) {
        return this.getPagedData(this.getSortedData([...this.data]));
      }
    }));
  }

  disconnect() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
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

