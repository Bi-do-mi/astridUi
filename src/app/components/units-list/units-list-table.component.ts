import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../_services/user.service';
import {Unit} from '../../_model/Unit';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {MapService} from '../../_services/map.service';
import {SidenavService} from '../../_services/sidenav.service';
import {UnitDataSource} from '../../_model/UnitDataSource';
import {UnitInfoCardDialogComponent} from '../unit-info-card-dialog/unit-info-card-dialog.component';
import {SetLocationCallService} from '../../_services/set-location-call.service';
import {UnitCreateDialogComponent} from '../unit-create-dialog/unit-create-dialog.component';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {NgxGalleryImage} from '@kolkov/ngx-gallery';
import {User} from '../../_model/User';
import {ParkService} from '../../_services/park.service';

@Component({
  selector: 'app-units-list',
  templateUrl: './units-list-table.component.html',
  styleUrls: ['./units-list-table.component.scss']
})
export class UnitsListTableComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  curUser: User;

  dataSource: UnitDataSource;
  displayedColumns: string[] = ['model'];

  constructor(public userService: UserService,
              private mapServ: MapService,
              private dialog: MatDialog,
              private sidenavService: SidenavService,
              private setLocationService: SetLocationCallService,
              public parkService: ParkService) {
  }

  ngOnInit() {
    this.dataSource = new UnitDataSource(this.userService.currentUserUnits,
      this.paginator, this.sort);
    this.userService.currentUser.pipe(untilDestroyed(this)).subscribe(user => {
      this.curUser = user;
    });
  }

  ngOnDestroy() {
    // console.log('destroy!');
  }

  flyToUnit(unit: Unit) {
    this.sidenavService.closeAll();
    this.mapServ.flyTo(unit.location);
    this.mapServ.markerIndication(unit.location);
  }

  openUnitInfoCardDialog(unit: Unit) {
    const gallery: NgxGalleryImage[] = [];
    unit.images.forEach(i => {
      gallery.push({
        small: 'data:image/jpg;base64,' + i.value,
        medium: 'data:image/jpg;base64,' + i.value,
        big: 'data:image/jpg;base64,' + i.value
      });
    });
    const unitInfoDialogRef = this.dialog.open(UnitInfoCardDialogComponent, {
      maxHeight: '100vh',
      maxWidth: '100vw',
      backdropClass: 'leanerBack1',
      data: {unit: unit, image: gallery}
    });
    unitInfoDialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe(unit_ => {
      if (unit_) {
        this.openUnitCreateDialog(unit_);
      }
    });
  }

  openUnitCreateDialog(unit?: Unit): void {
    const dialogRef = this.dialog.open(UnitCreateDialogComponent, {
      maxHeight: '100vh',
      maxWidth: '100vw',
      backdropClass: 'leanerBack1',
      data: {unit: unit, stepNum: 0}
    });
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((result?: string) => {
      if (result === 'setLocation') {
        this.setLocationService.set(true, unit, 3);
      }
    });
  }
}

