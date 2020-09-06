import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UnitDataSource} from '../../_model/UnitDataSource';
import {SearchService} from '../../_services/search.service';
import {Unit} from '../../_model/Unit';
import {SidenavService} from '../../_services/sidenav.service';
import {MapService} from '../../_services/map.service';
import {UnitInfoCardDialogComponent} from '../unit-info-card-dialog/unit-info-card-dialog.component';
import {SetLocationCallService} from '../../_services/set-location-call.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {NgxGalleryImage} from '@kolkov/ngx-gallery';

@Component({
  selector: 'app-filtered-units-list-table',
  templateUrl: './filtered-units-list-table.component.html',
  styleUrls: ['./filtered-units-list-table.component.scss']
})
export class FilteredUnitsListTableComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  displayedColumns: string[] = ['model'];
  dataSource: UnitDataSource;

  constructor(
    private searchService: SearchService,
    private sidenavService: SidenavService,
    private dialog: MatDialog,
    private mapServ: MapService,
    private setLocationService: SetLocationCallService) {
  }

  ngOnInit() {
    this.dataSource = new UnitDataSource(
      this.searchService.filteredAllUnits, this.paginator, this.sort);
  }

  ngOnDestroy() {
    // console.log('ngOnDestroy');
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
    // unitInfoDialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe(unit_ => {
    //   if (unit_) {
    //     this.openUnitCreateDialog(unit_);
    //   }
    // });
  }

  // openUnitCreateDialog(unit?: Unit): void {
  //   const dialogRef = this.dialog.open(UnitCreateDialogComponent, {
  //     maxHeight: '100vh',
  //     maxWidth: '100vw',
  //     backdropClass: 'leanerBack1',
  //     data: {unit: unit, stepNum: 0}
  //   });
  //   dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((result?: string) => {
  //     if (result === 'setLocation') {
  //       this.setLocationService.set(true, unit, 3);
  //     }
  //   });
  // }
}
