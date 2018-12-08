import {Injectable} from '@angular/core';
import {MatSidenav} from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  private _sidenav: MatSidenav;

  set sidenav(value: MatSidenav) {
    this._sidenav = value;
  }

  constructor() {
  }

  public toggle(isOpen?: boolean) {
    this._sidenav.toggle(isOpen);
  }

  public open() {
    this._sidenav.open();
  }

  public close() {
    this._sidenav.close();
  }
}
