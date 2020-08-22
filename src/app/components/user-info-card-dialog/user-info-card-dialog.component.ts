import {Component, Inject, OnInit} from '@angular/core';
import {User} from '../../_model/User';
import {ZonedDateTime} from '@js-joda/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {first} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {ParkService} from '../../_services/park.service';
import {MapService} from '../../_services/map.service';
import {OpenParkListService} from '../../_services/open-park-list.service';

@Component({
  selector: 'app-user-info-card-dialog',
  templateUrl: './user-info-card-dialog.component.html',
  styleUrls: ['./user-info-card-dialog.component.scss']
})
export class UserInfoCardDialogComponent implements OnInit {
  public user: User;

  constructor(
    private dialogRef: MatDialogRef<UserInfoCardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private dialog: MatDialog,
    private parkService: ParkService,
    private mapService: MapService,
    public openParkList: OpenParkListService) {
  }

  ngOnInit() {
    this.user = this.data.user;
    if (this.data.user.image && (!this.data.user.image.value)) {
      this.parkService.loadUsersImgFromServer(this.data.user)
        .pipe(first())
        .subscribe((data: User) => {
          this.user.image.value = data.image.value;
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  showOnMap() {
    this.onCancel();
    this.mapService.flyTo(this.user.location);
    this.mapService.markerIndication(this.user.location);
  }

  showUnitsList() {
    this.onCancel();
    this.openParkList.open(this.user);
  }

}
