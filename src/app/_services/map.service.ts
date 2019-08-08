import {Injectable, OnDestroy, OnInit} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {LngLatBounds, Marker} from 'mapbox-gl';
import {NGXLogger} from 'ngx-logger';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {User} from '../_model/User';
import {SnackBarService} from './snack-bar.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {FeatureCollection, GeoJson} from '../_model/MarkerSourceModel';
import {UserService} from './user.service';
import {first} from 'rxjs/operators';
import {GeoCode} from '../_model/GeoCode';
import {SidenavService} from './sidenav.service';


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
  public privateMarkers = new Array<Marker>();
  userGeoCode: GeoCode;
  public _hidePrivateUnits = false;
  isPopupOpened = false;


  constructor(private logger: NGXLogger,
              private userService: UserService,
              private snackBarService: SnackBarService,
              private http: HttpClient,
              private sidenavService: SidenavService) {
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
          // map initialization
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

          // movestart listener
          this.map.on('movestart', (event) => {
            if ((this.privateMarkers.length > 0 || this.userMarker) && this.isPopupOpened) {
              this.privateMarkers.forEach(m => {
                if (m.getPopup().isOpen()) {
                  m.togglePopup();
                }
              });
              if (this.userMarker.getPopup().isOpen()) {
                this.userMarker.togglePopup();
              }
              this.isPopupOpened = false;
            }
          });

          // load listener
          this.map.on('load', (event) => {

            // Adding popup, user's marker and user's geocode
            this.userService.currentUser.pipe(untilDestroyed(this))
              .subscribe(user => {
                this.currentUser = user;
                try {
                  if (user.location) {
                    if (this.userMarker) {
                      this.userMarker.remove();
                    }
                    const popup = new mapboxgl.Popup({offset: 45});
                    popup.on('open', e => {
                      this.isPopupOpened = true;
                    });
                    const el = document.createElement('div');
                    el.className = 'office_marker';
                    this.userMarker = new Marker(el, {offset: [0, -23]});
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
                try {
                  if (user.units && user.units.length > 0) {
                    this.hidePrivateUnits(true);
                    this.privateMarkers.splice(0);
                    user.units.forEach(unit => {
                      const popup = new mapboxgl.Popup({offset: 10});
                      const outerCircle = document.createElement('div');
                      outerCircle.className = 'private_unit_marker_out';
                      const innerCircle = document.createElement('div');
                      innerCircle.className = 'private_unit_marker_in';
                      outerCircle.appendChild(innerCircle);

                      const unitMarker = new Marker(outerCircle);
                      unitMarker.setLngLat([
                        unit.location.geometry.coordinates[0],
                        unit.location.geometry.coordinates[1]
                      ]).setPopup(popup.setText(unitMarker.getLngLat().lng
                        + ', ' + unitMarker.getLngLat().lat));
                      unitMarker.getPopup().on('open', e => {
                        this.isPopupOpened = true;
                      });
                      this.privateMarkers.push(unitMarker);
                    });
                    this.hidePrivateUnits(false);
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
    // this.logger.info('getMarkers triggered!');
    return this.http.get<any>('rest/users/all');
  }

  flyTo(data: GeoJson) {
    this.map.flyTo({
      center: [data.geometry.coordinates[0], data.geometry.coordinates[1]],
      zoom: 9
    });
  }

  hidePrivateUnits(hide: boolean) {
    this.sidenavService.closeAll();
    this._hidePrivateUnits = hide || !this._hidePrivateUnits;
    if (this._hidePrivateUnits) {
      this.privateMarkers.forEach(marker => {
        marker.remove();
      });
    } else {
      this.privateMarkers.forEach(marker => {
        if (this.currentUser.location.geometry.coordinates[0]
          !== marker.getLngLat().lng &&
          this.currentUser.location.geometry.coordinates[1]
          !== marker.getLngLat().lng) {
          marker.addTo(this.map);
        }
      });
    }
  }

  // get bbox of private units
  getBoundingBox(data: Array<Marker>): LngLatBounds {
    const fs: FeatureCollection = new FeatureCollection(new Array<GeoJson>());
    const bounds: LngLatBounds = new LngLatBounds();
    let coords: number[];
    let latitude: number;
    let longitude: number;
    data.forEach(marker => {
      const feature = new GeoJson(marker.getLngLat().toArray());
      fs.features.push(feature);
    });
    for (let i = 0; i < fs.features.length; i++) {
      coords = fs.features[i].geometry.coordinates;
      longitude = coords[0];
      latitude = coords[1];
      if (bounds.getSouthWest()) {
        const west = bounds.getWest() < longitude ? bounds.getWest() : longitude;
        const east = bounds.getEast() > longitude ? bounds.getEast() : longitude;
        const south = bounds.getSouth() < latitude ? bounds.getSouth() : latitude;
        const north = bounds.getNorth() > latitude ? bounds.getNorth() : latitude;
        bounds.setSouthWest([west, south]);
        bounds.setNorthEast([east, north]);
      } else {
        bounds.setSouthWest([longitude, latitude]);
        bounds.setNorthEast([longitude, latitude]);
      }
    }
    return bounds;
  }

  // панарамирование своей техники
  fitBounds(bounds: LngLatBounds) {
    this.sidenavService.closeAll();
    this.map.fitBounds(bounds, {
      padding: {
        top: 40, bottom: 40,
        left: 40, right: 40
      }
    });
    // this.drawLines();
  }

  // drawLines() {
  //   const featureCollection = new FeatureCollection(new Array<GeoJson>());
  //   const startPoint = this.currentUser.location.geometry.coordinates;
  //   this.privateMarkers.forEach(marker => {
  //     const line = new GeoJson([startPoint, marker.getLngLat().toArray()]);
  //     line.type = 'LineString';
  //     featureCollection.features.push(line);
  //   });
  //   // const source: AnySourceData = JSON.stringify(featureCollection);
  //   this.map.addSource('lines_to_units', featureCollection);
  //   this.map.addLayer({
  //     'id': 'lines_to_units',
  //     'type': 'line',
  //
  //     'source': {
  //       'type': 'geojson',
  //       'data': source
  //     }
  //   });
  //   console.log(JSON.stringify(featureCollection));
  // }

  ngOnDestroy() {
  }
}
