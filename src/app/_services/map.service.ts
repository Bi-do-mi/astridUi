import {ElementRef, Injectable} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {el} from '@angular/platform-browser/testing/src/browser_util';
import {NGXLogger} from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private _map: mapboxgl.Map;


  constructor(private logger: NGXLogger) {
  }


  get map(): mapboxgl.Map {
    return this._map;
  }

  set map(value: mapboxgl.Map) {
    this._map = value;
  }
}
