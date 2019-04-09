import {Injectable} from '@angular/core';
import {MatSidenav} from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  private _right_sidenav: MatSidenav;
  private _left_sidenav: MatSidenav;

  set right_sidenav(rSidenav: MatSidenav) {
    this._right_sidenav = rSidenav;
  }

  set left_sidenav(lSidenav: MatSidenav) {
    this._left_sidenav = lSidenav;
  }

  constructor() {
  }

  public toggleRight(isOpen?: boolean) {
    this._right_sidenav.toggle(isOpen);
  }

  public toggleLeft(isOpen?: boolean) {
    this._left_sidenav.toggle(isOpen);
  }

  public openRight() {
    this._right_sidenav.open();
  }

  public openLeft() {
    this._left_sidenav.open();
  }

  public closeRight() {
    this._right_sidenav.close();
  }

  public closeLeft() {
    this._left_sidenav.close();
  }

  public closeAll() {
    this._right_sidenav.close();
    this._left_sidenav.close();
  }
}
