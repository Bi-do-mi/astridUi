import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Unit} from '../../_model/Unit';
import {UserService} from '../../_services/user.service';
import {MapService} from '../../_services/map.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {UnitDataSource} from '../../_model/UnitDataSource';
import {UnitInfoCardDialogComponent} from '../unit-info-card-dialog/unit-info-card-dialog.component';
import {UnitCreateDialogComponent} from '../unit-create-dialog/unit-create-dialog.component';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions} from '@kolkov/ngx-gallery';
import {ParkService} from '../../_services/park.service';
import {finalize, first} from 'rxjs/operators';
import {SnackBarService} from '../../_services/snack-bar.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {User} from '../../_model/User';
import {BehaviorSubject, Observable} from 'rxjs';
import {SearchService} from '../../_services/search.service';


@Component({
  selector: 'app-units-main-list-dialog',
  templateUrl: './units-main-list-dialog.component.html',
  styleUrls: ['./units-main-list-dialog.component.scss']
})
export class UnitsMainListDialogComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  dataSource: UnitDataSource;
  columnsToDisplay = ['model'];
  galleryOptions: NgxGalleryOptions[];
  galleryImagesMap: Map<number, NgxGalleryImage[]>;
  private userUnits$ = new BehaviorSubject<Unit[]>(new Array<Unit>());
  userUnits = this.userUnits$.asObservable();

  constructor(
    private dialogRef: MatDialogRef<UnitsMainListDialogComponent>,
    private dialog: MatDialog,
    public userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private mapServ: MapService,
    private parkService: ParkService,
    private spinner: NgxSpinnerService,
    private snackbarService: SnackBarService,
    private searchService: SearchService) {

    this.searchService.filteredAllUnits.pipe(untilDestroyed(this), first())
      .subscribe(units => {
        if (units && units.length) {
          this.userUnits$.next(units.filter(u => u.ownerId === this.data.user.id));
        } else {
          if (this.data.user.units) {
            this.userUnits$.next(this.data.user.units);
          }
        }
      });
  }

  ngOnInit() {
    // console.log('data: user.loc: ' + this.data.user.location);
    this.galleryImagesMap = new Map();
    // this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().pipe(untilDestroyed(this))
      .subscribe(_ => {
        this.onCancel();
      });
    if (this.data.user.units) {
      this.initSources(this.userUnits);
    } else {
      this.initSources(this.userService.currentUserUnits);
    }

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

  initSources(units: Observable<Array<Unit>>) {
    this.dataSource = new UnitDataSource(
      units, this.paginator, this.sort);
    units.pipe(untilDestroyed(this), first())
      .subscribe(units_ => {
        units_.forEach(u => {
          let galleryImages: NgxGalleryImage[] = [];
          this.galleryImagesMap.set(u.id, galleryImages);
          if (u.images && u.images.length > 0) {
            this.fillGallery(u, galleryImages);
          }
          if (u.images && u.images.length > 0 && (!u.images[0].value)) {
            this.parkService.loadUnitImgFromServer(u).pipe(first())
              .subscribe(un => {
                u.images = [...un.images];
                galleryImages = [];
               this.fillGallery(u, galleryImages);
                this.galleryImagesMap.set(u.id, galleryImages);
              });
          }
        });
      });
  }

  fillGallery(u: Unit, galleryImages: NgxGalleryImage[]) {
    u.images.forEach(i => {
      const im = 'data:image/jpg;base64,' + i.value;
      galleryImages.push({
        small: im,
        medium: im,
        big: im
      });
    });
  }

  flyToUnit(unit: Unit) {
    this.onCancel();
    this.mapServ.flyTo(unit.location);
    this.mapServ.markerIndication(unit.location);
  }

  onCancel(unit?: Unit): void {
    this.dialogRef.close(unit);
  }

  openUnitInfoCardDialog(unit: Unit) {
    const unitInfoDialogRef = this.dialog.open(UnitInfoCardDialogComponent, {
      maxHeight: '100vh',
      maxWidth: '100vw',
      backdropClass: 'leanerBack1',
      data: {unit}
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
      backdropClass: 'leanerBack1',
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

  onToggleUnitVisiobility(unit: Unit) {
    unit.enabled = !unit.enabled;
    this.spinner.show();
    this.parkService.updateUnit(unit).pipe(first(), untilDestroyed(this),
      finalize(() => {
        this.spinner.hide();
        this.snackbarService.success('Единица техники успешно обновлена',
          'OK', 5000);
      })).subscribe(() => {
      },
      error1 => {
        console.log(error1);
        this.spinner.hide();
        this.snackbarService.error('Что-то пошло не так', 'OK');
      });
  }
}
