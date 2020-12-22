// Users Data Source Class    //////////////////////////////////////////////////////////////////////
import {DataSource} from '@angular/cdk/table';
import {Injectable, OnDestroy} from '@angular/core';
import {merge, Observable, Subscription} from 'rxjs';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {map} from 'rxjs/operators';
import {User} from './User';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';

@Injectable()
export class UserDataSource extends DataSource<User> implements OnDestroy {
  public data: User[];
  private subscription1: Subscription;
  private subscription2: Subscription;

  constructor(
    private dataObservable: Observable<User[]>,
    private paginator: MatPaginator,
    private sort: MatSort) {
    super();
    this.subscription1 = this.dataObservable
      .pipe(untilDestroyed(this)).subscribe(u => {
        this.data = u;
      });
  }

  ngOnDestroy() {
  }

  connect(): Observable<User[]> {
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

  private getPagedData(data: User[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  private getSortedData(data: User[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'id':
          return this.compare(a.id, b.id, isAsc);
        case 'username':
          return this.compare(a.username, b.username, isAsc);
        case 'name':
          return this.compare(a.name, b.name, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? -1 : 1);
  }
}

