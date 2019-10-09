import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../_services/user.service';
import {Unit} from '../../_model/Unit';
import {MatDialog, MatPaginator, MatSort} from '@angular/material';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {MapService} from '../../_services/map.service';
import {SidenavService} from '../../_services/sidenav.service';
import {UnitDataSource} from '../../_model/UnitDataSource';
import {UnitInfoCardDialogComponent} from '../unit-info-card-dialog/unit-info-card-dialog.component';
import {NgxGalleryImage} from 'ngx-gallery';
import {SetLocationCallService} from '../../_services/set-location-call.service';
import {UnitCreateDialogComponent} from '../unit-create-dialog/unit-create-dialog.component';

@Component({
  selector: 'app-units-list',
  templateUrl: './units-list-table.component.html',
  styleUrls: ['./units-list-table.component.scss']
})
export class UnitsListTableComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  dataSource: UnitDataSource;
  displayedColumns: string[] = ['model'];

  constructor(public userService: UserService,
              private mapServ: MapService,
              private dialog: MatDialog,
              private sidenavService: SidenavService,
              private setLocationService: SetLocationCallService) {
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
      backdropClass: 'leanerBack',
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
      backdropClass: 'leanerBack',
      data: {unit: unit, stepNum: 0}
    });
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((result?: string) => {
        if (result === 'setLocation') {
        this.setLocationService.set(true, unit, 3);
      }
    });
  }
}

