import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {User} from '../../_model/User';
import {Unit} from '../../_model/Unit';
import {ParkService} from '../../_services/park.service';
import {first} from 'rxjs/operators';
import {OpenUserInfoService} from '../../_services/open-user-info.service';
import {OpenUnitInfoService} from '../../_services/open-unit-info.service';
import {SearchService} from '../../_services/search.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {OpenParkListService} from '../../_services/open-park-list.service';

@Component({
  selector: 'app-users-popup',
  templateUrl: './users-popup.component.html',
  styleUrls: ['./users-popup.component.scss']
})
export class UsersPopupComponent implements OnInit, OnDestroy {
  private _user: User;
  arr: Array<Unit>;
  isExpand: Array<boolean>;

  constructor(private parkService: ParkService,
              private searchService: SearchService,
              private openUnitInfoService: OpenUnitInfoService,
              private openUserInfoService: OpenUserInfoService,
              private openParkList: OpenParkListService) {
  }

  ngOnInit() {
    this.arr.forEach(_unit => {
      if (_unit.images && _unit.images.length > 0 && (!_unit.images[0].value)) {
        this.parkService.loadUnitImgFromServer(_unit).pipe(first())
          .subscribe((data: Unit) => {
            _unit.images = data.images;
          });
      }
    });
  }

  ngOnDestroy() {
    // console.log('ngOnDestroy');
  }

  get user(): User {
    return this._user;
  }

  @Input()
  set user(value: User) {
    this._user = value;
    if (this._user.units && this._user.units.length > 0) {
      this.arr = new Array<Unit>();
      this.isExpand = new Array<boolean>();
      this.isExpand.push(true);

      this.searchService.filteredAllUnits.pipe(untilDestroyed(this), first())
        .subscribe(units => {
          if (units && units.length) {
            units.filter(u => u.ownerId === this._user.id).forEach(unit => {
              this.arr.push(unit);
              this.isExpand.push(false);
            });
          } else {
            this._user.units.forEach((un: Unit) => {
              if (this.parkService.unitsInPark.has(un.id)) {
                this.arr.push(un);
                this.isExpand.push(false);
              }
            });
          }
        });

      this.arr = this.arr.slice(0, 5);
    }
  }

  public expandDiv(ind: number) {
    for (let i = 0; i < (this.isExpand.length); i++) {
      if (ind === i) {
        this.isExpand[i] = true;
      } else {
        this.isExpand[i] = false;
      }
    }
  }

  public openUserInfoCardDialog() {
    this.openUserInfoService.open(this.user);
  }

  public openUnitInfoCardDialog(unit: Unit) {
    this.openUnitInfoService.open(unit);
  }

  showUnitsList() {
    this.openParkList.open(this.user);
  }
}
