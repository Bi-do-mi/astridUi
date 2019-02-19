import {Injectable} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {NGXLogger} from 'ngx-logger';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Point} from 'mapbox-gl';

declare var require: any;

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


  constructor(private logger: NGXLogger,
              private http: HttpClient) {
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

  getMarkers(): Observable<any> {
    return this.http.get<any>('rest/markers/all');
  }

  createMarker(point: Point) {
    const wkt = 'POINT(' + point.x + ' ' + point.y + ')';
    console.log(wkt);
    this.http.get('https://geocoder.tilehosting.com/r/' + point.x + '/' + point.y + '.js?key=hg1h55E0Z3ft5je5zeKI')
      .subscribe(stname => {
        console.log(stname);
      });
    return this.http.put<any>('rest/geo/create-markers', wkt).subscribe(data => {
      console.log(data);
    }, error => {
      console.log(error);
      // throw error;
    });
  }

  // removeMarker(marker: GeoJson) {
  //   return this.http.delete('rest/markers/delete-marker?id=' + marker.properties.id);
  // }
}
