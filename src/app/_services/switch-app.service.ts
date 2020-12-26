import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SwitchAppService {

  public staticPages = true;

  constructor() {
    // console.log('SwitchAppService');
  }

  appOn() {
    this.staticPages = false;
  }
  appOff() {
    this.staticPages = true;
  }
}
