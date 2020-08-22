import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Unit} from '../../_model/Unit';
import {DeleteUnitDialogComponent} from '../delete-unit-dialog/delete-unit-dialog.component';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {UserService} from '../../_services/user.service';
import {User} from '../../_model/User';
import {first, map} from 'rxjs/operators';
import {OpenUnitInfoService} from '../../_services/open-unit-info.service';
import {ZonedDateTime} from '@js-joda/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions} from '@kolkov/ngx-gallery';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {ParkService} from '../../_services/park.service';
import {HttpClient} from '@angular/common/http';
import {DateDeserializerService} from '../../_services/date-deserializer.service';
import {OpenUserInfoService} from '../../_services/open-user-info.service';
import {UnitOptionModel} from '../unit-create-dialog/UnitOptions/UnitOptionModel';
import {UNIT_OPTIONS_CONSTANTS} from '../../constants/UnitOptionsConstants';

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
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(
    Breakpoints.Handset).pipe(map(result => result.matches));
  public align1: string;
  public layout1: string;
  owner: User;
  public measures: Map<string, string>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dialogRef: MatDialogRef<UnitInfoCardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { unit: Unit },
    private dialog: MatDialog,
    private userService: UserService,
    private openUnitInfoService: OpenUnitInfoService,
    private openUserInfoService: OpenUserInfoService,
    private parkService: ParkService,
    private http: HttpClient,
    private dateDeserializer: DateDeserializerService) {
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
    this.isHandset$.subscribe((res) => {
      this.align1 = res ? 'space-between end' : 'space-between center';
      this.layout1 = res ? 'column' : 'row wrap';
    });
    this.parkService.usersCacheFiltered.pipe(first())
      .subscribe((owners: Array<User>) => {
        this.owner = owners.filter((user: User) => {
          return user.id === this.unit.ownerId;
        })[0];
        if (!this.owner) {
          this.http.put('/rest/search/get_owner', this.unit.ownerId)
            .pipe(first()).subscribe((u: User) => {
            this.owner = this.dateDeserializer.date(u);
          });
        }
      });
    if (this.unit.options && this.unit.options.length > 0) {
      this.measures = new Map<string, string>();
      this.unit.options.forEach(op => {
        UNIT_OPTIONS_CONSTANTS.forEach((constOp) => {
          if (constOp.key.replace(/\s+/g, '_').toLowerCase()
            === op.label.replace(/\s+/g, '_').toLowerCase()) {
            this.measures.set(op.label, constOp.measure);
          }
        });
      });
    }
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

  openUserInfoCard() {
    this.onCancel();
    setTimeout(() => {
      this.openUserInfoService.open(this.owner);
    }, 100);
  }

  ngOnDestroy() {
  }
}
