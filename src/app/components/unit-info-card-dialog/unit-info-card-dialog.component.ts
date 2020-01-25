import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Unit} from '../../_model/Unit';
import {NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions} from 'ngx-gallery';
import {DateTimeFormatter, TemporalField, Year, ZonedDateTime} from 'js-joda';
import {DeleteUnitDialogComponent} from '../delete-unit-dialog/delete-unit-dialog.component';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {UserService} from '../../_services/user.service';
import {User} from '../../_model/User';
import {first} from 'rxjs/operators';
import {OpenUnitInfoService} from '../../_services/open-unit-info.service';

@Component({
  selector: 'app-unit-info-card-dialog',
  templateUrl: './unit-info-card-dialog.component.html',
  styleUrls: ['./unit-info-card-dialog.component.scss']
})
export class UnitInfoCardDialogComponent implements OnInit, OnDestroy {
  unit = new Unit();
  images: NgxGalleryImage[] = [];
  galleryOptions: NgxGalleryOptions[];
  public isPrivate = false;


  constructor(
    private dialogRef: MatDialogRef<UnitInfoCardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { unit: Unit },
    private dialog: MatDialog,
    private userService: UserService,
    private openUnitInfoService: OpenUnitInfoService) {
  }

  ngOnInit() {
    this.userService.currentUser.pipe(first(), untilDestroyed(this))
      .subscribe((user: User) => {
        if (user.units && user.units.length > 0) {
          user.units.forEach((u: Unit) => {
            if (u.id === this.data.unit.id) {
              this.isPrivate = true;
            }
          });
        }
      });
    // this.dialogRef.disableClose = true;
    this.unit = this.data.unit;
    this.openUnitInfoService.getGallery(this.data.unit, this.images);
    this.galleryOptions = [
      {
        width: '390px',
        height: '260px',
        thumbnails: false,
        imageArrows: false,
        imageAnimation: NgxGalleryAnimation.Slide,
        previewInfinityMove: true,
        previewCloseOnEsc: true
      },
      {
        breakpoint: 800,
        width: '360px',
        height: '240px'
      },
      {
        breakpoint: 600,
        width: '330px',
        height: '220px'
      },
      {
        breakpoint: 400,
        width: '210px',
        height: '140px'
      }
    ];
  }

  onCancel(): void {
    // console.log('onClose: \n' + this.data.unit.images.length);
    this.dialogRef.close();
  }

  getDate(d: ZonedDateTime) {
    return d.toString().substring(0, d.toString().indexOf('T'));
  }

  onEdit() {
    this.dialogRef.close(this.unit);
  }

  onDeleteUnit() {
    const deleteUnitDialogRef = this.dialog.open(DeleteUnitDialogComponent, {
      maxHeight: '100vh',
      maxWidth: '100vw',
      data: {unit: this.data.unit}
    });
    deleteUnitDialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe(result => {
      if (result) {
        this.onCancel();
      }
    });
  }

  ngOnDestroy() {
  }
}
