import {HostListener, Injectable, OnDestroy, OnInit} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {Marker} from 'mapbox-gl';
import {NGXLogger} from 'ngx-logger';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {User} from '../_model/User';
import {SnackBarService} from './snack-bar.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {GeoJson} from '../_model/MarkerSourceModel';
import {UserService} from './user.service';
import {first} from 'rxjs/operators';
import {GeoCode} from '../_model/GeoCode';


@Injectable({
  providedIn: 'root'
})
export class MapService implements OnInit, OnDestroy {

  private _map: mapboxgl.Map;
  private _style = 'https://maps.tilehosting.com/c/33e373c9-90c4-41b1-99f1-4883169a4e6d/styles/streets/style.json?key=VRgdrAzvUsWnu6iigRja';
  private _mapOps: {
    lng: number;
    lat: number;
    zoom: number;
  };
  markers: any;
  features: any;
  private _isFirstLoading: boolean;
  private _mapTemplateId$ = new BehaviorSubject<string>('');
  currentMapId = this._mapTemplateId$.asObservable();
  private _clickedPoint$ = new Subject<GeoJson>();
  private _clickedPoint = this._clickedPoint$.asObservable();
  currentUser: User;
  private userMarker: Marker;
  userGeoCode: GeoCode;


  constructor(private logger: NGXLogger,
              private userService: UserService,
              private snackBarService: SnackBarService,
              private http: HttpClient) {
    this.initializeMap();
  }

  ngOnInit() {
  }

  private initializeMap() {
    this.markers = new Array<mapboxgl.Marker>();
    this.features = this.getMarkers().pipe(untilDestroyed(this));
    this.buildMap();
  }

  buildMap() {
    // console.log('buildMap triggered!');
    this._mapOps = {
      lng: 37.622504,
      lat: 55.753215,
      zoom: 9
    };

    this._isFirstLoading = true;
    this.currentMapId.pipe(untilDestroyed(this)).subscribe(mapId => {
      if (mapId) {
        // отступ по времени для правильного отображения карты
        setTimeout(() => {
          this._map = new mapboxgl.Map({
            container: mapId,
            style: this._style,
            zoom: this._mapOps.zoom,
            center: [this._mapOps.lng, this._mapOps.lat]
          });

          // Add map controls
          this._map.addControl(new mapboxgl.NavigationControl());
          this._map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {enableHighAccuracy: true}
          }));
          this._map.addControl(new mapboxgl.ScaleControl());
          this._map.addControl(new mapboxgl.FullscreenControl());

          // click listener
          this._map.on('click', (event) => {
            const p = new GeoJson([
              +event.lngLat.lng.toFixed(6),
              +event.lngLat.lat.toFixed(6)]);
            this._clickedPoint$.next(p);
          });

          // load listener
          this.map.on('load', (event) => {

            this.userService.currentUser.pipe(untilDestroyed(this))
              .subscribe(user => {
                this.currentUser = user;
                try {
                  if (user.location) {
                    if (this.userMarker) {
                      this.userMarker.remove();
                    }
                    const popup = new mapboxgl.Popup({offset: 50});
                    const el = document.createElement('div');
                    el.className = 'marker';
                    this.userMarker = new Marker(el, {offset: [0, -20]});
                    this.userMarker.setLngLat([
                      this.currentUser.location.geometry.coordinates[0],
                      this.currentUser.location.geometry.coordinates[1]])
                      .setPopup(popup.setText(String(this.userMarker.getLngLat().lng)
                        + ', ' + this.userMarker.getLngLat().lat))
                      .addTo(this.map);
                    this.getGeocodeByPoint(this.currentUser.location).pipe(first(),
                      untilDestroyed(this)).subscribe((geoCode: GeoCode) => {
                      this.userGeoCode = geoCode;
                    });
                  }
                } catch (e) {
                  console.log(e);
                }
              });
          });
          this.navigatorCheck();
        }, 10);
      }
    });
  }

  private navigatorCheck() {
    if (navigator.geolocation && this._isFirstLoading) {
      navigator.geolocation.getCurrentPosition(position => {
          this._mapOps.lng = position.coords.longitude;
          this._mapOps.lat = position.coords.latitude;
          setTimeout(() => {
            this._map.flyTo({center: [this._mapOps.lng, this._mapOps.lat], zoom: 9});
            this._isFirstLoading = false;
          }, 1000);
        },
        error => {
          this.snackBarService.error('Ваш браузер заблокировал передачу геоданных', 'OK');
        });
    }
  }

  saveMapOps() {
    this._mapOps.lng = this._map.getCenter().lng;
    this._mapOps.lat = this._map.getCenter().lat;
    this._mapOps.zoom = this._map.getZoom();
  }

  get map(): mapboxgl.Map {
    return this._map;
  }

  get style(): string {
    return this._style;
  }

  set style(value: string) {
    this._style = value;
  }

  get mapOps(): {
    lng: number; lat: number;
    zoom: number;
  } {
    return this._mapOps;
  }

  set mapOps(value: {
    lng: number; lat: number;
    zoom: number;
  }) {
    this._mapOps = value;
    this._isFirstLoading = false;
  }

  get isFirstLoading(): boolean {
    return this._isFirstLoading;
  }

  set mapTemplateId$(value: string) {
    this._mapTemplateId$.next(value);
  }


  get clickedPoint(): Observable<GeoJson> {
    return this._clickedPoint;
  }

  get clickedPoint$(): Subject<GeoJson> {
    return this._clickedPoint$;
  }

  getGeocodeByPoint(point: GeoJson): Observable<any> {
    if (point) {
      return this.http.get('https://geocoder.tilehosting.com/r/'
        + point.geometry.coordinates[0] + '/' + point.geometry.coordinates[1]
        + '.js?key=hg1h55E0Z3ft5je5zeKI');
    } else {
      return null;
    }
  }

  getMarkers(): Observable<any> {
    return this.http.get<any>('rest/users/all');
  }

  flyTo(data: GeoJson) {
    this.map.flyTo({
      center: [data.geometry.coordinates[0], data.geometry.coordinates[1]],
      zoom: 9
    });
  }

//   addPopup(marker: Marker) {
//     const coordinates = marker.getLngLat().toArray().slice();
//
// // Ensure that if the map is zoomed out such that multiple
// // copies of the feature are visible, the popup appears
// // over the copy being pointed to.
//     while (Math.abs(marker.getLngLat().lng - coordinates[0]) > 180) {
//       coordinates[0] += marker.getLngLat().lng > coordinates[0] ? 360 : -360;
//     }
//
//     new mapboxgl.Popup()
//       .setLngLat(coordinates)
//       .setHTML('<strong>Truckeroo</strong><p> brings dozens of food trucks, live music,' +
//         ' and games to half and M Street SE (across from Navy Yard Metro Station)' +
//         ' today from 11:00 a.m. to 11:00 p.m.</p>')
//       .addTo(this.map);
//   }


  ngOnDestroy() {
  }
}
