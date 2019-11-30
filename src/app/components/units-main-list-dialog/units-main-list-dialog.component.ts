import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MatPaginator, MatSort} from '@angular/material';
import {Unit} from '../../_model/Unit';
import {UserService} from '../../_services/user.service';
import {MapService} from '../../_services/map.service';
import {SidenavService} from '../../_services/sidenav.service';
import {DataSource} from '@angular/cdk/table';
import {Observable, Subscription, merge} from 'rxjs';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {map} from 'rxjs/operators';
import {NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions} from 'ngx-gallery';
import {UnitDataSource} from '../../_model/UnitDataSource';
import {UnitInfoCardDialogComponent} from '../unit-info-card-dialog/unit-info-card-dialog.component';
import {UnitCreateDialogComponent} from '../unit-create-dialog/unit-create-dialog.component';


@Component({
  selector: 'app-units-main-list-dialog',
  templateUrl: './units-main-list-dialog.component.html',
  styleUrls: ['./units-main-list-dialog.component.scss']
})
export class UnitsMainListDialogComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource: UnitDataSource;
  columnsToDisplay = ['model'];
  galleryOptions: NgxGalleryOptions[];
  galleryImagesMap: Map<number, NgxGalleryImage[]>;

  constructor(
    private dialogRef: MatDialogRef<UnitsMainListDialogComponent>,
    private dialog: MatDialog,
    public userService: UserService,
    private mapServ: MapService,
    private sidenavService: SidenavService) {
  }

  ngOnInit() {
    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().pipe(untilDestroyed(this))
      .subscribe(_ => {
        this.onCancel();
      });
    this.dataSource = new UnitDataSource(
      this.paginator, this.sort, this.userService);
    this.userService.currentUserUnits.pipe(untilDestroyed(this))
      .subscribe(units => {
      this.galleryImagesMap = new Map();
      units.forEach(u => {
        const galleryImages: NgxGalleryImage[] = [];
        if (u.images.length > 0) {
          u.images.forEach(i => {
            const im = 'data:image/jpg;base64,' + i.value;
            galleryImages.push({
              small: im,
              medium: im,
              big: im
            });
          });
        } else {
          galleryImages.push({
            small: null,
            medium: null,
            big: null
          });
        }
        this.galleryImagesMap.set(u.id, galleryImages);
      });
    });
    this.galleryOptions = [
      {
        width: '150px',
        height: '100px',
        thumbnails: false,
        imageArrows: false,
        imageAnimation: NgxGalleryAnimation.Slide,
        previewInfinityMove: true,
        previewCloseOnEsc: true
      },
      {
        breakpoint: 800,
        width: '120px',
        height: '80px'
      },
      {
        breakpoint: 600,
        width: '90px',
        height: '60px'
      },
      {
        breakpoint: 400,
        width: '60px',
        height: '40px'
      }
    ];
  }


  ngOnDestroy() {
  }

  flyToUnit(unit: Unit) {
    this.onCancel();
    this.mapServ.flyTo(unit.location);
  }

  onCancel(unit?: Unit): void {
    this.dialogRef.close(unit);
  }

  openUnitInfoCardDialog(unit: Unit) {
    const unitInfoDialogRef = this.dialog.open(UnitInfoCardDialogComponent, {
      maxHeight: '100vh',
      maxWidth: '100vw',
      backdropClass: 'leanerBack',
      data: {unit, image: this.galleryImagesMap.get(unit.id)}
    });
    unitInfoDialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe(unit_ => {
      if (unit_) {
        this.onCancel(unit_);
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
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe(result => {
      if (result) {
        this.openUnitInfoCardDialog(result);
      }
    });
  }

  getSpacer(unit: Unit) {
    let galleryImages: NgxGalleryImage[] = [];
    if (unit.images.length > 0) {
      galleryImages = this.galleryImagesMap.get(unit.id);
    } else {
      galleryImages.push({
        small: 'assets/pics/unit_pic_spacer-600x400.png',
        medium: 'assets/pics/unit_pic_spacer-600x400.png',
        big: 'assets/pics/unit_pic_spacer-600x400.png'
      });
    }
    return galleryImages;
  }
}
