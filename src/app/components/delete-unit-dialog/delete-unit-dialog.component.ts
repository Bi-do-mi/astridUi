import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {first, take} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {ParkService} from '../../_services/park.service';
import {Unit} from '../../_model/Unit';
import {SnackBarService} from '../../_services/snack-bar.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UserService} from "../../_services/user.service";
import {MapService} from "../../_services/map.service";
import {User} from "../../_model/User";

@Component({
  selector: 'app-delete-unit-dialog',
  templateUrl: './delete-unit-dialog.component.html',
  styleUrls: ['./delete-unit-dialog.component.scss']
})
export class DeleteUnitDialogComponent implements OnInit, OnDestroy {

  submitted = false;
  loading = false;
  currentUser: User;

  constructor(
    private dialogRef: MatDialogRef<DeleteUnitDialogComponent>,
    private parkService: ParkService,
    @Inject(MAT_DIALOG_DATA) public data: { unit: Unit },
    private snackBarService: SnackBarService,
    private userService: UserService,
    public mapService: MapService) {
  }

  ngOnInit() {
    this.userService.currentUser.pipe(take(1)).subscribe(u => {
      this.currentUser = u;
    })
  }

  ngOnDestroy() {
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    this.parkService.deleteUnit(this.data.unit)
      .pipe(first(), untilDestroyed(this))
      .subscribe((u) => {
          if (this.currentUser && this.currentUser.username === 'bidomi@mail.ru') {
            this.mapService.refreshData();
          }
          if (u) {
            // console.log(u);
            this.loading = false;
            this.dialogRef.close(true);
            this.snackBarService.success(this.data.unit.model +
              ' был удален.',
              'OK', 10000);
          } else {
            this.loading = false;
            this.dialogRef.close(false);
            this.snackBarService.error('Процесс удаления прерван.',
              'OK', 10000);
          }
        },
        error => {
          this.loading = false;
          console.log(error);
          this.snackBarService.error('Что-то пошло не так.');
        });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
