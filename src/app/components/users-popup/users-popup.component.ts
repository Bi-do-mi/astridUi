import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../_model/User';
import {Unit} from '../../_model/Unit';
import {ParkService} from '../../_services/park.service';

@Component({
  selector: 'app-users-popup',
  templateUrl: './users-popup.component.html',
  styleUrls: ['./users-popup.component.scss']
})
export class UsersPopupComponent implements OnInit {
  private _user: User;

  constructor(private parkService: ParkService) {
  }

  ngOnInit() {
  }

  get user(): User {
    return this._user;
  }

  @Input()
  set user(value: User) {
    this._user = value;
    if (this._user.image && (!this._user.image.value)) {
      this.parkService.loadUsersImgFromServer(this._user).subscribe((data: User) => {
        this._user.image = data.image;
      });
    }
  }
}
