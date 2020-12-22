//  Data Source Class    //////////////////////////////////////////////////////////////////////
import {DataSource} from '@angular/cdk/table';
import {Unit} from './Unit';
import {Injectable, OnDestroy} from '@angular/core';
import {merge, Observable, Subscription} from 'rxjs';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {first, map} from 'rxjs/operators';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';

@Injectable()
export class UnitDataSource extends DataSource<Unit> implements OnDestroy {
  public data: Unit[];
  private subscription1: Subscription;
  private subscription2: Subscription;

  constructor(
    private dataObservable: Observable<Unit[]>,
    private paginator: MatPaginator,
    private sort: MatSort) {
    super();
    this.subscription1 = this.dataObservable
      .pipe(untilDestroyed(this)).subscribe(u => this.data = u);
  }

  ngOnDestroy() {
  }

  connect(): Observable<Unit[]> {
    const dataMutations = [
      this.dataObservable,
      this.paginator.page,
      this.sort.sortChange
    ];
    this.subscription2 = this.dataObservable.pipe(untilDestroyed(this))
      .subscribe((u: Array<any>) => {
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

  // возвращает порцию юнитов из массива
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

