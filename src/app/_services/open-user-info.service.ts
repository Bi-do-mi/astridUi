import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {User} from '../_model/User';

@Injectable({
  providedIn: 'root'
})
export class OpenUserInfoService {
  private openUserInfo$ = new Subject();
  openUserInfo = this.openUserInfo$.asObservable();

  constructor() { }

  open(user: User) {
    this.openUserInfo$.next({user});
  }
}
