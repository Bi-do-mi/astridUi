import {Injectable, OnDestroy, OnInit, Renderer2, RendererFactory2} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {LngLatBounds, Marker, Point} from 'mapbox-gl';
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
import {Unit} from '../_model/Unit';
import {OpenUnitInfoService} from './open-unit-info.service';
import * as turf from '@turf/turf';


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
  private _isFirstLoading: boolean;
  private _mapTemplateId$ = new BehaviorSubject<string>('');
  currentMapId = this._mapTemplateId$.asObservable();
  private _clickedPoint$ = new Subject<GeoJson>();
  private _clickedPoint = this._clickedPoint$.asObservable();
  currentUser: User;
  public userMarker: Marker;
  public privateMarkers = new Array<Marker>();
  userGeoCode: GeoCode;
  public _hidePrivateUnits = false;
  isPopupOpened = false;
  renderer: Renderer2;


  constructor(private logger: NGXLogger,
              private userService: UserService,
              private snackBarService: SnackBarService,
              private http: HttpClient,
              private openUnitInfoService: OpenUnitInfoService,
              private sidenavService: SidenavService,
              private rendererFactory: RendererFactory2) {
    this.initializeMap();
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  ngOnInit() {
  }

  private initializeMap() {
    this.buildMap();
  }

  buildMap() {
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
          try {
            this._map = new mapboxgl.Map({
              container: mapId,
              style: this._style,
              zoom: this._mapOps.zoom,
              center: [this._mapOps.lng, this._mapOps.lat]
            });
          } catch (e) {
            console.log('Failed to load map!');
          }

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
                if (m.getPopup() && m.getPopup().isOpen()) {
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

            this.userService.currentUser.pipe(untilDestroyed(this))
              .subscribe(user => {
                this.currentUser = user;
                // Adding popup, user's marker and user's geocode
                try {
                  if (this.userMarker) {
                    this.userMarker.remove();
                  }
                  if (user.location) {
                    this.createUserMarker(user);
                    this.getGeocodeByPoint(this.currentUser.location).pipe(first(),
                      untilDestroyed(this)).subscribe((geoCode: GeoCode) => {
                      this.userGeoCode = geoCode;
                    });
                  }
                } catch (e) {
                  console.log(e);
                }
                // Adding popups to units
                try {
                  this.hidePrivateUnits(true);
                  this.sidenavService.closeAll();
                  if (user.units && user.units.length > 0) {
                    this.privateMarkers.splice(0);
                    user.units.forEach(unit => {
                      this.privateMarkers.push(this.createUnitMarker(unit));
                    });
                    this.hidePrivateUnits(false);
                  }
                } catch (e) {
                  console.log(e);
                }
              });
            this.navigatorCheck();
          });
        }, 10);
      }
    });
  }

  // prnt() {
  //   console.log('ldklsbnlsb');
  // }

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

  flyTo(data: GeoJson) {
    this.map.flyTo({
      center: [data.geometry.coordinates[0], data.geometry.coordinates[1]],
      zoom: 9
    });
  }

  hidePrivateUnits(hide?: boolean) {
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
  getBoundingBox(data: Array<Marker>, parkPoint?: Marker): LngLatBounds {
    const fs: FeatureCollection = new FeatureCollection(new Array<GeoJson>());
    const bounds: LngLatBounds = new LngLatBounds();
    let coords: number[];
    let latitude: number;
    let longitude: number;
    data.forEach(marker => {
      const feature = new GeoJson(marker.getLngLat().toArray());
      fs.features.push(feature);
    });
    if (parkPoint) {
      const feature = new GeoJson(parkPoint.getLngLat().toArray());
      fs.features.push(feature);
    }
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
    console.log(bounds);
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


  markerIndication(unit: Unit) {
    if (this.userMarker.getLngLat().lng === unit.location.geometry.coordinates[0]) {
      if (this.userMarker.getLngLat().lat === unit.location.geometry.coordinates[1]) {
        let pulsar = true;
        const markerTimer = setInterval(() => {
          this.userMarker.getElement().hidden = pulsar;
          pulsar = !pulsar;
        }, 500);
        setTimeout(() => {
          clearInterval(markerTimer);
          this.userMarker.getElement().hidden = false;
        }, 6000);

      }
    } else {
      this.privateMarkers.forEach(marker => {
        if (marker.getLngLat().lng === unit.location.geometry.coordinates[0]) {
          if (marker.getLngLat().lat === unit.location.geometry.coordinates[1]) {
            let pulsar = true;
            const markerTimer = setInterval(() => {
              marker.getElement().hidden = pulsar;
              pulsar = !pulsar;
            }, 500);
            setTimeout(() => {
              clearInterval(markerTimer);
              marker.getElement().hidden = false;
            }, 6000);

          }
        }
      });
    }
  }

  openUnitInfoCardDialog(unit: Unit) {
    this.openUnitInfoService.open(unit);
  }

  ngOnDestroy() {
  }

  createUnitMarker(unit: Unit) {
    const markerHeight = 50, markerRadius = 10, linearOffset = 25;
    const popupOffsets = {
      'top': new Point(0, 40),
      'top-left': new Point(0, 0),
      'top-right': new Point(0, 0),
      'bottom': new Point(0, 10),
      'bottom-left': new Point(0, 0),
      'bottom-right': new Point(0, 0),
      'left': new Point(0, 0),
      'right': new Point(0, 0)
    };
    const popup = new mapboxgl.Popup();
    const outerCircle = this.renderer.createElement('div');
    // adding outerCircle click listener
    outerCircle.addEventListener('click', () => {
      if (unitMarker.getPopup().isOpen()) {
        unitMarker.togglePopup();
      }
      this.openUnitInfoCardDialog(unit);
    });
    const unitMarker = new Marker(outerCircle);
    this.renderer.setAttribute(outerCircle, 'class', 'private_unit_marker_out');
    const innerCircle = this.renderer.createElement('div');
    (unit.paid && unit.enabled) ?
      this.renderer.setAttribute(innerCircle, 'class', 'private_unit_marker_in_active') :
      this.renderer.setAttribute(innerCircle, 'class', 'private_unit_marker_in_passive');
    outerCircle.appendChild(innerCircle);

    // adding mouseenter listener
    let timer: any;
    let isMouseOnPopup = false;
    outerCircle.addEventListener('mouseenter', () => {
      if (!unitMarker.getPopup()) {
        // adding popups mouseenter listener
        const div = this.renderer.createElement('div');
        this.renderer.setStyle(div, 'cursor', 'pointer');
        div.addEventListener('mouseenter', () => isMouseOnPopup = true);

        // adding popups mouselive listener
        div.addEventListener('mouseleave', () => {
          isMouseOnPopup = false;
          if (unitMarker.getPopup().isOpen()) {
            unitMarker.togglePopup();
          }
        });
        // adding popups click listener
        div.addEventListener('click', () => {
          isMouseOnPopup = false;
          if (unitMarker.getPopup().isOpen()) {
            unitMarker.togglePopup();
          }
          this.openUnitInfoCardDialog(unit);
        });
        div.innerHTML =
          '<div>\n' +
          '<img src=' +
          (unit.images[0] ? 'data:image/jpg;base64,' + unit.images[0].value
            : 'assets/pics/unit_pic_spacer-500x333.png')
          + ' width="80">\n' +
          '<div style="display: inline-block">\n' +
          '<p>' + unit.model + '</p>\n' +
          '</div></div>';
        unitMarker.setPopup(popup.setDOMContent(div)
          .on('open', e => {
            this.isPopupOpened = true;
          }));
      }
      timer = setTimeout(() => {
        if (!unitMarker.getPopup().isOpen()) {
          unitMarker.togglePopup();
        }
      }, 500);
    });

    // adding mouseleave listener
    outerCircle.addEventListener('mouseleave',
      () => {
        if (!unitMarker.getPopup().isOpen()) {
          clearTimeout(timer);
        }
        if (unitMarker.getPopup().isOpen()) {
          setTimeout(() => {
            clearTimeout(timer);
            if (!isMouseOnPopup) {
              unitMarker.togglePopup();
            }
          }, 500);
        }
      });
    unitMarker.setLngLat([
      unit.location.geometry.coordinates[0],
      unit.location.geometry.coordinates[1]
    ]);
    return unitMarker;
  }

  createUserMarker(user: User) {
    const popup = new mapboxgl.Popup({offset: 45});
    popup.on('open', e => {
      this.isPopupOpened = true;
    });
    const el = this.renderer.createElement('div');
    this.renderer.setAttribute(el, 'class', 'office_marker');
    // el.addEventListener('click', () => {
    //   if (this.userMarker.getPopup().isOpen()) {
    //     this.userMarker.togglePopup();
    //   }
    // });
    this.userMarker = new Marker(el, {offset: [0, -23]});
    this.userMarker.setLngLat([
      this.currentUser.location.geometry.coordinates[0],
      this.currentUser.location.geometry.coordinates[1]])
      .setPopup(popup.setText(String(this.userMarker.getLngLat().lng)
        + ', ' + this.userMarker.getLngLat().lat))
      .addTo(this.map);
  }
}

