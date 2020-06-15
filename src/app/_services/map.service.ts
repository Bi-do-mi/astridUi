import {Injectable, OnDestroy, OnInit, Renderer2, RendererFactory2} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {GeoJSONSource, LngLat, MapboxGeoJSONFeature, Marker} from 'mapbox-gl';
import {NGXLogger} from 'ngx-logger';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {User} from '../_model/User';
import {SnackBarService} from './snack-bar.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import * as FCollModel from '../_model/MarkerSourceModel';
import {GeoJson} from '../_model/MarkerSourceModel';
import {UserService} from './user.service';
import {first} from 'rxjs/operators';
import {GeoCode} from '../_model/GeoCode';
import {SidenavService} from './sidenav.service';
import {Unit} from '../_model/Unit';
import {environment} from '../../environments/environment.prod';
import {NgElement, WithProperties} from '@angular/elements';
import {ParkService} from './park.service';
import * as _helpers from '@turf/helpers';
import {Feature, FeatureCollection, MultiPolygon, Polygon} from '@turf/helpers';
import * as turf from '@turf/turf';
import {UnitsPopupComponent} from '../components/units-popup/units-popup.component';
import {UsersPopupComponent} from '../components/users-popup/users-popup.component';
import {PopupService} from './popup.service';

// import * as _difference from '@turf/difference';


@Injectable({
  providedIn: 'root'
})
export class MapService implements OnInit, OnDestroy {

  private _map: mapboxgl.Map;
  private _style = 'https://api.maptiler.com/maps/5b2a7949-f12c-4095-8fad-5dd65ce2c0ef/style.json?key=VRgdrAzvUsWnu6iigRja';
  // 'https://api.maptiler.com/maps/5b2a7949-f12c-4095-8fad-5dd65ce2c0ef/style.json?key=hg1h55E0Z3ft5je5zeKI';
  // 'https://maps.tilehosting.com/c/33e373c9-90c4-41b1-99f1-4883169a4e6d/styles/streets/style.json?key=VRgdrAzvUsWnu6iigRja';
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
  userGeoCode: GeoCode;
  public _hidePrivateUnits = false;
  public _hideOtherUnits = false;
  renderer: Renderer2;
  private ownUnitsSource: any;
  private usersSource: any;
  public unitsSource: any;
  private viewportSource: any;
  private queryViewportSource: any;
  private colors = ['#212121', '#fbc02d', '#c2c3c2', '#0bc714'];
  private viewportMultiPolygons: Feature<MultiPolygon> = turf.multiPolygon([]);
  private queryPolygon: Feature<MultiPolygon>;
  private isViewportFirstLoading = true;
  private usersCache_ = new Array<User>();
  private unitsCache_ = new Array<Unit>();


  constructor(private logger: NGXLogger,
              private userService: UserService,
              private snackBarService: SnackBarService,
              private http: HttpClient,
              private sidenavService: SidenavService,
              private rendererFactory: RendererFactory2,
              private parkService: ParkService,
              private popupService: PopupService) {
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
            console.log('Failed to load map!\n' + e);
          }

          // Add map controls
          this._map.addControl(new mapboxgl.NavigationControl());
          this._map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {enableHighAccuracy: true}
          }));
          this._map.addControl(new mapboxgl.ScaleControl());
          this._map.addControl(new mapboxgl.FullscreenControl());

          // map click listener
          this._map.on('click', (event) => {
            const p = new GeoJson(
              [+event.lngLat.lng.toFixed(6),
                +event.lngLat.lat.toFixed(6)]);
            this._clickedPoint$.next(p);
          });

          // map movestart listener
          // this.map.on('movestart', () => {
          //   if ((this.privateMarkers.length > 0 || this.userMarker) && this.isPopupOpened) {
          //     this.privateMarkers.forEach(m => {
          //       if (m.getPopup() && m.getPopup().isOpen()) {
          //         m.togglePopup();
          //       }
          //     });
          //     if (this.userMarker.getPopup() && this.userMarker.getPopup().isOpen()) {
          //       this.userMarker.togglePopup();
          //     }
          //     this.isPopupOpened = false;
          //   }
          // });

          // map moveend listener
          this.map.on('moveend', () => {
            this.loadDataOnMoveEnd();
            // if (this.map.getZoom() >= 8) {
            //   this.loadDataOnMoveEnd();
            // }
            // if (this.map.getZoom() < 8 && !this.snackBarService.isOpen()) {
            //   this.snackBarService.success('Для загрузки данных приблизьте карту.', 'OK', 10000);
            // }
          });

          // load listener
          this.map.on('load', () => {

            /// register sources
            this.map.addSource('ownUnitsSource', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: []
              },
              cluster: true,
              clusterMaxZoom: 8, // Max zoom to cluster points on
              clusterRadius: 50
            });
            this.map.addSource('usersSource', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: []
              },
              cluster: true,
              clusterMaxZoom: 8, // Max zoom to cluster points on
              clusterRadius: 50
            });
            this.map.addSource('unitsSource', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: []
              },
              cluster: true,
              clusterMaxZoom: 8, // Max zoom to cluster points on
              clusterRadius: 50
            });
            this.map.addSource('viewportSource', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: [[[]]]
                },
                properties: {}
              }
            });
            this.map.addSource('queryViewportSource', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: [[[]]]
                },
                properties: {}
              }
            });

            /// get source
            this.ownUnitsSource = this.map.getSource('ownUnitsSource');
            this.usersSource = this.map.getSource('usersSource');
            this.unitsSource = this.map.getSource('unitsSource');
            this.viewportSource = this.map.getSource('viewportSource');
            this.queryViewportSource = this.map.getSource('queryViewportSource');

            // create map layers with realtime data
            this.map.addLayer({
              id: 'viewportLayer',
              source: 'viewportSource',
              type: 'fill',
              layout: {},
              paint: {
                'fill-color': '#088',
                'fill-opacity': 0.5
              }
            });
            this.map.addLayer({
              id: 'queryViewportLayer',
              source: 'queryViewportSource',
              type: 'fill',
              layout: {},
              paint: {
                'fill-color': 'red',
                'fill-opacity': 0.5
              }
            });
            this.map.addLayer({
              id: 'ownUnitsLayer',
              source: 'ownUnitsSource',
              type: 'circle',
              filter: ['!', ['has', 'point_count']],
              paint: {
                'circle-color': ['case',
                  ['case',
                    ['has', 'paid'], ['get', 'paid'],
                    false], this.colors[1],
                  this.colors[2]],
                'circle-radius': 4,
                'circle-stroke-width': 2,
                'circle-stroke-color': this.colors[0]
              }
            });
            this.map.addLayer({
              id: 'ownUnitsLayerClusters',
              type: 'circle',
              source: 'ownUnitsSource',
              filter: ['has', 'point_count'],
              paint: {
                'circle-color': [
                  'step',
                  ['get', 'point_count'],
                  '#FBDC2E',
                  100,
                  '#FBC02D',
                  750,
                  '#FBAF30'
                ],
                'circle-radius': [
                  'step',
                  ['get', 'point_count'],
                  20,
                  100,
                  30,
                  750,
                  40
                ],
                'circle-stroke-color': this.colors[0],
                'circle-stroke-width': 3
              }
            });
            this.map.addLayer({
              id: 'ownUnitsLayerClusterCount',
              type: 'symbol',
              source: 'ownUnitsSource',
              filter: ['has', 'point_count'],
              layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
              }
            });
            this.map.addLayer({
              id: 'unitsLayer',
              source: 'unitsSource',
              type: 'circle',
              filter: ['!', ['has', 'point_count']],
              paint: {
                'circle-color': ['case',
                  ['case',
                    ['has', 'paid'], ['get', 'paid'],
                    false], this.colors[3],
                  this.colors[2]],
                'circle-radius': 4,
                'circle-stroke-width': 2,
                'circle-stroke-color': this.colors[0]
              }
            });
            this.map.addLayer({
              id: 'unitsLayerClusters',
              type: 'circle',
              source: 'unitsSource',
              filter: ['has', 'point_count'],
              paint: {
                'circle-color': [
                  'step',
                  ['get', 'point_count'],
                  '#0dea18',
                  100,
                  '#0bc714',
                  750,
                  '#099f10'
                ],
                'circle-radius': [
                  'step',
                  ['get', 'point_count'],
                  20,
                  100,
                  30,
                  750,
                  40
                ],
                'circle-stroke-color': this.colors[0],
                'circle-stroke-width': 3
              }
            });
            this.map.addLayer({
              id: 'unitsLayerClusterCount',
              type: 'symbol',
              source: 'unitsSource',
              filter: ['has', 'point_count'],
              layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
              }
            });
            this.map.addLayer({
              id: 'usersLayer',
              source: 'usersSource',
              type: 'symbol',
              filter: ['!', ['has', 'point_count']],
              layout: {
                'text-field': 'P',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 14
              },
              paint: {
                'text-color': '#0dea18',
                'text-halo-color': '#212121',
                'text-halo-width': 1
              }
            });
            this.map.addLayer({
              id: 'usersLayerClusters',
              type: 'circle',
              source: 'usersSource',
              filter: ['has', 'point_count'],
              paint: {
                'circle-color': '#212121',
                'circle-radius': [
                  'step',
                  ['get', 'point_count'],
                  20,
                  100,
                  30,
                  750,
                  40
                ],
                'circle-stroke-color': this.colors[0],
                'circle-stroke-width': 3
              }
            });
            this.map.addLayer({
              id: 'usersLayerClusterCount',
              type: 'symbol',
              source: 'usersSource',
              filter: ['has', 'point_count'],
              layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
              },
              paint: {
                'text-color': '#0dea18',
                'text-halo-color': '#ffffff',
                'text-halo-width': 1
              }
            });

            this.userService.currentUser.pipe(untilDestroyed(this))
              .subscribe(user => {
                this.currentUser = user;
                this.ownUnitsSource.setData(new FCollModel.FeatureCollection(new Array<GeoJson>()));
                this.parkService.loadDataOnMoveEnd(this.viewportMultiPolygons);
                // Adding popup, user's marker and user's geocode
                try {
                  if (this.userMarker) {
                    this.userMarker.remove();
                  }
                  if (user.location) {
                    this.userMarker = this.popupService.createUserMarker(this.userMarker, this.map);
                    this.userMarker.addTo(this.map);
                    this.getGeocodeByPoint(this.currentUser.location).pipe(first(),
                      untilDestroyed(this)).subscribe((geoCode: GeoCode) => {
                      this.userGeoCode = geoCode;
                    });
                  }
                } catch (e) {
                  console.log(e);
                }

                if (user.units && user.units.length > 0) {
                  const unitsLocArray = new Array<GeoJson>();
                  user.units.forEach(unit => {
                    if (user.location.geometry.coordinates[0] !== unit.location.geometry.coordinates[0]) {
                      unitsLocArray.push(new GeoJson(
                        unit.location.geometry.coordinates,
                        unit.id, {paid: environment.testing_paid ? true : unit.paid}));
                    }
                  });
                  const data = new FCollModel.FeatureCollection(unitsLocArray);
                  // console.log(JSON.stringify(data));
                  this.ownUnitsSource.setData(data);
                }
              });
            this.parkService.usersCacheFiltered.pipe(untilDestroyed(this))
              .subscribe((usersCache: Array<User>) => {
                this.usersCache_ = usersCache;
                this.updateUsersSource();
              });
            this.parkService.unitsCacheFiltered.pipe(untilDestroyed(this))
              .subscribe((unitsCache: Array<Unit>) => {
                this.unitsCache_ = unitsCache;
                this.updateUnitsSource();
              });
          });
          this.popupService.tunePopup(this.map, 'ownUnitsLayer', 'ownUnitsLayerClusters', 'ownUnitsSource');
          this.popupService.tunePopup(this.map, 'unitsLayer', 'unitsLayerClusters', 'unitsSource');
          this.popupService.tunePopup(this.map, 'usersLayer', 'usersLayerClusters', 'usersSource');
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

  flyTo(data: GeoJson) {
    const pointer = new Marker();
    this.map.flyTo({
      center: [data.geometry.coordinates[0], data.geometry.coordinates[1]],
      zoom: 9
    });
  }

  hidePrivateUnits(hide?: boolean) {
    this.sidenavService.closeAll();
    this._hidePrivateUnits = hide || !this._hidePrivateUnits;
    const layers = ['ownUnitsLayer', 'ownUnitsLayerClusters', 'ownUnitsLayerClusterCount'];
    layers.forEach(layer => {
      this.map.setLayoutProperty(layer, 'visibility',
        this._hidePrivateUnits ? 'none' : 'visible');
    });
  }

  hideOtherUnits(hide?: boolean) {
    this.sidenavService.closeAll();
    this._hideOtherUnits = hide || !this._hideOtherUnits;
    const layers = ['unitsLayer', 'unitsLayerClusters', 'unitsLayerClusterCount',
      'usersLayer', 'usersLayerClusters', 'usersLayerClusterCount'];
    layers.forEach(layer => {
      this.map.setLayoutProperty(layer, 'visibility',
        this._hideOtherUnits ? 'none' : 'visible');
    });
  }

  // панарамирование своей техники
  fitBounds() {
    this.sidenavService.closeAll();
    const bounds = new mapboxgl.LngLatBounds();
    this.currentUser.units.forEach(unit => {
      bounds.extend(new LngLat(unit.location.geometry.coordinates[0],
        unit.location.geometry.coordinates[1]));
    });
    bounds.extend(this.userMarker.getLngLat());
    this.map.fitBounds(bounds, {
      padding: {
        top: 40, bottom: 40,
        left: 40, right: 40
      }
    });
  }


  markerIndication(location: GeoJson) {
    // console.log('location: ' + JSON.stringify(location));
    if (this.userMarker &&
      (this.userMarker.getLngLat().lng === location.geometry.coordinates[0]) &&
      (this.userMarker.getLngLat().lat === location.geometry.coordinates[1])
    ) {
      let pulsar = true;
      const markerTimer = setInterval(() => {
        this.userMarker.getElement().hidden = pulsar;
        pulsar = !pulsar;
      }, 500);
      setTimeout(() => {
        clearInterval(markerTimer);
        this.userMarker.getElement().hidden = false;
      }, 6000);
    } else {
      const markerDiv = this.renderer.createElement('pulsar');
      // this.renderer.setAttribute(markerDiv, 'class', 'private_unit_marker_out');
      this.renderer.setProperty(markerDiv, 'innerHTML',
        '<svg class = "button" expanded = "true" height = "100px" width = "100px">\n' +
        '            <circle class = "innerCircle" cx = "50%" cy = "50%" r = "25%" ' +
        'fill = "none" stroke = "#212121" stroke-width = "5%">\n' +
        '              <animate attributeType="SVG" attributeName="r" begin="0s" ' +
        'dur="1.5s" repeatCount="3" from="5%" to="25%"/>\n' +
        '              <animate attributeType="CSS" attributeName="stroke-width" begin="0s" ' +
        ' dur="1.5s" repeatCount="3" from="3%" to="0%" />\n' +
        '              <animate attributeType="CSS" attributeName="opacity" begin="0s" ' +
        ' dur="1.5s" repeatCount="3" from="1" to="0"/>\n' +
        '            </circle>\n' +
        '        </svg>');
      const pulsarPointer = new Marker(markerDiv);
      pulsarPointer.setLngLat([location.geometry.coordinates[0],
        location.geometry.coordinates[1]]);
      setTimeout(() => {
        pulsarPointer.addTo(this.map);
        pulsarPointer.getElement().hidden = true;
        setTimeout(() => {
          pulsarPointer.getElement().hidden = false;
          setTimeout(() => {
            pulsarPointer.remove();
          }, 3900);
        }, 300);
      }, 1000);
    }
  }

  ngOnDestroy() {
  }

  getCurrentViewportFromMap() {
    return _helpers.polygon([[
      this.map.getBounds().getNorthEast().toArray(),
      this.map.getBounds().getSouthEast().toArray(),
      this.map.getBounds().getSouthWest().toArray(),
      this.map.getBounds().getNorthWest().toArray(),
      this.map.getBounds().getNorthEast().toArray()]]);
  }

  loadDataOnMoveEnd() {
    const currentViewportFromMap = this.getCurrentViewportFromMap();
    const currentViewportFromMapMultiP = <Feature<MultiPolygon>> turf.multiPolygon(
      [currentViewportFromMap.geometry.coordinates]);

    // init viewportMultiPolygons
    if (this.viewportMultiPolygons.geometry.coordinates.length === 0) {
      this.viewportMultiPolygons.geometry.coordinates.push(
        currentViewportFromMap.geometry.coordinates);
    }

    // should do request?
    // if equal, full outside or overlapsing
    let isViewportMultiPolygonsContain = false;
    this.viewportMultiPolygons.geometry.coordinates.forEach(coord => {
      const poly = turf.polygon(coord);
      if (turf.booleanContains(poly, currentViewportFromMap)) {
        isViewportMultiPolygonsContain = true;
      }
    });
    let isCurrentViewportContain = false;
    if (!turf.difference(this.viewportMultiPolygons, currentViewportFromMapMultiP)
      && turf.difference(currentViewportFromMapMultiP, this.viewportMultiPolygons)) {
      isCurrentViewportContain = true;
    }

    // add if not intersect
    if (!isCurrentViewportContain
      && !turf.booleanEqual(currentViewportFromMapMultiP, this.viewportMultiPolygons)
      && !turf.difference(this.viewportMultiPolygons, currentViewportFromMapMultiP)
      && !turf.difference(currentViewportFromMapMultiP, this.viewportMultiPolygons)) {
      currentViewportFromMapMultiP.geometry.coordinates.forEach(coord => {
        this.viewportMultiPolygons.geometry.coordinates.push(coord);
      });
    }

    if (!isViewportMultiPolygonsContain ||
      (turf.booleanEqual(this.viewportMultiPolygons, currentViewportFromMapMultiP)
        && this.isViewportFirstLoading)) {
      const oldViewportMultiPolygon = turf.clone(this.viewportMultiPolygons);
      if (!this.isViewportFirstLoading) {
        this.viewportMultiPolygons.geometry.coordinates.push(
          currentViewportFromMap.geometry.coordinates);
        const result = this.joinPolygons(this.viewportMultiPolygons);
        // console.log('result: \n' + JSON.stringify(result));
        this.viewportMultiPolygons = turf.clone(result);
      }

      // query
      if (turf.booleanEqual(oldViewportMultiPolygon, this.viewportMultiPolygons)) {
        this.queryPolygon = this.viewportMultiPolygons;
      } else {
        if (turf.getType(turf.difference(this.viewportMultiPolygons,
          oldViewportMultiPolygon)) === 'Polygon') {
          this.queryPolygon = turf.multiPolygon([(<Feature<Polygon>>turf.difference(
            this.viewportMultiPolygons, oldViewportMultiPolygon)).geometry.coordinates]);
        } else {
          this.queryPolygon = <Feature<MultiPolygon>>turf.difference(this.viewportMultiPolygons,
            oldViewportMultiPolygon);
        }
      }

      this.parkService.loadDataOnMoveEnd(this.queryPolygon);

      // if (this.viewportSource) {
      //   this.viewportSource.setData(this.viewportMultiPolygons);
      // }
      // if (this.queryViewportSource) {
      //   this.queryViewportSource.setData(queryPolygon);
      // }
      this.isViewportFirstLoading = false;
    }
  }

  joinPolygons(mp: Feature<MultiPolygon>): Feature<MultiPolygon> {
    if (mp && mp.geometry.coordinates.length > 1) {
      let resultMPoly = turf.clone(mp);
      const mpLength = mp.geometry.coordinates.length;
      for (let i = 0; i < mpLength; i++) {
        const poly = turf.polygon(mp.geometry.coordinates[i]);
        for (let k = 0; k < mpLength; k++) {
          const poly2 = turf.polygon(mp.geometry.coordinates[k]);
          if (i !== k && !turf.booleanEqual(poly, poly2) && turf.intersect(poly, poly2)) {
            const joinedPoly = <Feature<Polygon>>turf.union(poly, poly2);
            resultMPoly.geometry.coordinates = [];
            resultMPoly.geometry.coordinates.push(joinedPoly.geometry.coordinates);
            for (let j = 0; j < mpLength; j++) {
              if (j !== i && j !== k) {
                resultMPoly.geometry.coordinates.push(mp.geometry.coordinates[j]);
              }
            }
            resultMPoly = this.joinPolygons(resultMPoly);
          }
        }
      }
      return resultMPoly;
    } else {
      return mp;
    }
  }

  updateUsersSource() {
    const tempArr = new Array<GeoJson>();
    this.usersCache_.forEach(us => {
      tempArr.push(new GeoJson(
        us.location.geometry.coordinates,
        us.id, {enabled: environment.testing_paid ? true : us.enabled}));
    });
    // console.log('unitsCacheFiltered.length: \n' + this.unitsCache_.length);
    this.usersSource.setData(new FCollModel.FeatureCollection(tempArr));
  }

  updateUnitsSource() {
    const tempArr = new Array<GeoJson>();
    this.unitsCache_.forEach(un => {
      tempArr.push(new GeoJson(
        un.location.geometry.coordinates,
        un.id, {paid: environment.testing_paid ? true : un.paid}));
    });
    this.unitsSource.setData(new FCollModel.FeatureCollection(tempArr));
    // console.log('unitsSource: \n' + JSON.stringify(this.unitsSource));
  }

  refreshData() {
    if (this.viewportMultiPolygons) {
      this.parkService.loadDataOnMoveEnd(this.viewportMultiPolygons, true);
    }
  }
}

