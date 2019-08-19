import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../_services/user.service';
import {map} from 'rxjs/operators';
import {Unit} from '../../_model/Unit';
import {DataSource} from '@angular/cdk/collections';
import {merge, Observable, Subscription} from 'rxjs';
import {MatPaginator, MatSort} from '@angular/material';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {MapService} from '../../_services/map.service';
import {SidenavService} from '../../_services/sidenav.service';
import {UnitDataSource} from '../../_model/UnitDataSource';

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

  constructor(public userService: UserService,
              private mapServ: MapService,
              private sidenavService: SidenavService) {
  }

  ngOnInit() {
    this.dataSource = new UnitDataSource(this.paginator, this.sort, this.userService);
  }

  ngOnDestroy() {
  }

  flyToUnit(unit: Unit) {
    this.sidenavService.closeAll();
    this.mapServ.flyTo(unit.location);
  }
}

