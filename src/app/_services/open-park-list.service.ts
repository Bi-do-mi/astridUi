import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {User} from '../_model/User';

@Injectable({
  providedIn: 'root'
})
export class OpenParkListService {
  private openParkList$ = new Subject();
  openParkList = this.openParkList$.asObservable();

  constructor() { }

  open(user: User) {
    this.openParkList$.next({user});
  }
}
