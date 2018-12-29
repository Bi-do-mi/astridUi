import {Injectable} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {NGXLogger} from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private _style = 'https://maps.tilehosting.com/c/33e373c9-90c4-41b1-99f1-4883169a4e6d/styles/streets/style.json?key=VRgdrAzvUsWnu6iigRja';
  private _mapOps: {
    lng: number;
    lat: number;
    zoom: number;
    source: any;
    markers: any;
  };
  private _isFirstLoading: boolean;


  constructor(private logger: NGXLogger) {
    this.mapOps = {
      lng: 37.622504,
      lat: 55.753215,
      zoom: 9,
      source: null,
      markers: null
    };
    this._isFirstLoading = true;
  }

  get style(): string {
    return this._style;
  }

  set style(value: string) {
    this._style = value;
  }

  get mapOps(): {
    lng: number; lat: number;
    zoom: number; source: any; markers: any
  } {
    return this._mapOps;
  }

  set mapOps(value: {
    lng: number; lat: number;
    zoom: number; source: any; markers: any
  }) {
    this._mapOps = value;
    this._isFirstLoading = false;
  }

  get isFirstLoading(): boolean {
    return this._isFirstLoading;
  }
}
