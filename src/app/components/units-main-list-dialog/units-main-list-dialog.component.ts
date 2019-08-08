import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MatPaginator, MatSort} from '@angular/material';
import {Unit} from '../../_model/Unit';
import {UserService} from '../../_services/user.service';
import {MapService} from '../../_services/map.service';
import {SidenavService} from '../../_services/sidenav.service';
import {DataSource} from '@angular/cdk/table';
import {Observable, Subscription, merge} from 'rxjs';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {map} from 'rxjs/operators';
import {NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions} from 'ngx-gallery';
import {UnitDataSource} from '../units-list/units-list-table.component';

@Component({
  selector: 'app-units-main-list-dialog',
  templateUrl: './units-main-list-dialog.component.html',
  styleUrls: ['./units-main-list-dialog.component.scss']
})
export class UnitsMainListDialogComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: UnitDataSource;
  columnsToDisplay = ['model'];
  galleryOptions: NgxGalleryOptions[];
  galleryImagesMap: Map<number, NgxGalleryImage[]>;

  constructor(
    private dialogRef: MatDialogRef<UnitsMainListDialogComponent>,
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
    this.userService.currentUserUnits.subscribe(units => {
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
            // console.log(i.value);
          });
        } else {
          galleryImages.push({
            small: 'assets/pics/unit_pic_spacer-600x400.png',
            medium: 'assets/pics/unit_pic_spacer-600x400.png',
            big: 'assets/pics/unit_pic_spacer-600x400.png'
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
  onCancel(): void {
    this.dialogRef.close();
  }
}
