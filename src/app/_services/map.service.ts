import {Injectable, OnDestroy, OnInit, Renderer2, RendererFactory2} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {GeoJSONSource, LngLat, MapboxGeoJSONFeature, Marker} from 'mapbox-gl';
import {NGXLogger} from 'ngx-logger';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {User} from '../_model/User';
import {SnackBarService} from './snack-bar.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {GeoJson} from '../_model/MarkerSourceModel';
import * as FCollModel from '../_model/MarkerSourceModel';
import {UserService} from './user.service';
import {first} from 'rxjs/operators';
import {GeoCode} from '../_model/GeoCode';
import {SidenavService} from './sidenav.service';
import {Unit} from '../_model/Unit';
import {OpenUnitInfoService} from './open-unit-info.service';
import {environment} from '../../environments/environment.prod';
// import {Feature, Polygon} from 'geojson';
import {ParkService} from './park.service';
import * as _helpers from '@turf/helpers';
import {Feature, FeatureCollection, MultiPolygon, Polygon} from '@turf/helpers';
import * as turf from '@turf/turf';

// import * as _difference from '@turf/difference';


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
  public privateMarkers: Array<Marker> = [];
  userGeoCode: GeoCode;
  public _hidePrivateUnits = false;
  isPopupOpened = false;
  renderer: Renderer2;
  private ownUnitsSource: any;
  private viewportSource: any;
  private queryViewportSource: any;
  private colors = ['#212121', '#fbc02d', '#c2c3c2'];
  private viewportMultiPolygons: Feature<MultiPolygon> = turf.multiPolygon([]);
  private isViewportFirstLoading = true;


  constructor(private logger: NGXLogger,
              private userService: UserService,
              private snackBarService: SnackBarService,
              private http: HttpClient,
              private openUnitInfoService: OpenUnitInfoService,
              private sidenavService: SidenavService,
              private rendererFactory: RendererFactory2,
              private parkService: ParkService) {
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
            const p = new GeoJson(
              [+event.lngLat.lng.toFixed(6),
                +event.lngLat.lat.toFixed(6)]);
            this._clickedPoint$.next(p);
          });

          // movestart listener
          this.map.on('movestart', () => {
            if ((this.privateMarkers.length > 0 || this.userMarker) && this.isPopupOpened) {
              this.privateMarkers.forEach(m => {
                if (m.getPopup() && m.getPopup().isOpen()) {
                  m.togglePopup();
                }
              });
              if (this.userMarker.getPopup() && this.userMarker.getPopup().isOpen()) {
                this.userMarker.togglePopup();
              }
              this.isPopupOpened = false;
            }
          });

          // moveend listener
          this.map.on('moveend', () => {
            if (this.map.getZoom() >= 8) {
              this.loadDataOnMoveend();
            }
            if (this.map.getZoom() < 8 && !this.snackBarService.isOpen()) {
              this.snackBarService.success('Для загрузки данных приблизте карту.', 'OK', 10000);
            }
          });

          // load listener
          this.map.on('load', () => {

            /// register sources
            // this.addSource('ownUnitsSource');
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

            this.userService.currentUser.pipe(untilDestroyed(this))
              .subscribe(user => {
                this.currentUser = user;
                this.ownUnitsSource.setData(new FCollModel.FeatureCollection(new Array<GeoJson>()));

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

                if (user.units && user.units.length > 0) {
                  const unitsLocArray = new Array<GeoJson>();
                  user.units.forEach(unit => {
                    unitsLocArray.push(new GeoJson(
                      unit.location.geometry.coordinates,
                      unit.id, {paid: environment.testing_paid ? true : unit.paid}));
                  });
                  const data = new FCollModel.FeatureCollection(unitsLocArray);
                  // console.log(JSON.stringify(data));
                  this.ownUnitsSource.setData(data);
                }
              });

            this.navigatorCheck();
          });

          this.map.on('click', 'ownUnitsLayer', (e) => {
            this.openUnitInfoCardDialog(this.currentUser.units
              .filter((unit, i, arr) => {
                if (unit.id === e.features[0].id) {
                  return true;
                }
              })[0]);
          });

          let timer: any;
          let isMouseOnPopup = false;
          const popup = new mapboxgl.Popup({
            closeButton: false, closeOnClick: false, offset: 10, maxWidth: '300'
          });

          this.map.on('mouseenter', 'ownUnitsLayer', (e) => {
            this.map.getCanvas().style.cursor = 'pointer';
            const unit = this.currentUser.units.filter((u, i, arr) => {
              if (u.id === e.features[0].id) {
                return true;
              }
            })[0];
            if (unit) {
              popup.setLngLat(e.lngLat);
              // adding popups mouseenter listener
              const div = this.renderer.createElement('div');
              this.renderer.setStyle(div, 'cursor', 'pointer');
              div.addEventListener('mouseenter', () => isMouseOnPopup = true);
              // adding popups mouselive listener
              div.addEventListener('mouseleave', () => {
                isMouseOnPopup = false;
                if (popup.isOpen()) {
                  popup.remove();
                }
              });
              // adding popups click listener
              div.addEventListener('click', () => {
                isMouseOnPopup = false;
                if (popup.isOpen()) {
                  popup.remove();
                }
                this.openUnitInfoCardDialog(unit);
              });
              div.innerHTML =
                '<div>\n' +
                '<img src=' +
                (unit.images[0] ? 'data:image/jpg;base64,' + unit.images[0].value
                  : 'assets/pics/unit_pic_spacer-500x333.png')
                + ' width="80">\n' +
                '<div  style="display: inline-block">\n' +
                '<p>' + unit.model + '</p>\n' +
                '</div></div>';
              popup.setDOMContent(div).on('open', () => {
                this.isPopupOpened = true;
              });
              timer = setTimeout(() => {
                if (!popup.isOpen()) {
                  popup.addTo(this.map);
                }
              }, 500);
            }
          });

          this.map.on('mouseleave', 'ownUnitsLayer', (e) => {
            this.map.getCanvas().style.cursor = '';
            if (!popup.isOpen()) {
              clearTimeout(timer);
            }
            if (popup.isOpen()) {
              setTimeout(() => {
                clearTimeout(timer);
                if (!isMouseOnPopup) {
                  popup.remove();
                }
              }, 500);
            }
          });

          // inspect a cluster on click
          this.map.on('click', 'ownUnitsLayerClusters', (e) => {
            const features = this.map.queryRenderedFeatures(e.point,
              {layers: ['ownUnitsLayerClusters']}) as MapboxGeoJSONFeature[];
            const clusterId = features[0].properties.cluster_id;
            const source = this.map.getSource('ownUnitsSource') as GeoJSONSource;
            source.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) {
                return;
              }
              this.map.easeTo({
                center: JSON.parse(JSON.stringify(features[0].geometry)).coordinates,
                zoom: zoom
              });
            });
          });

          this.map.on('mouseenter', 'ownUnitsLayerClusters', () => {
            this.map.getCanvas().style.cursor = 'pointer';
          });
          this.map.on('mouseleave', 'ownUnitsLayerClusters', () => {
            this.map.getCanvas().style.cursor = '';
          });
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


  markerIndication(unit: Unit) {
    if (false || this.userMarker.getLngLat() === new LngLat(
      unit.location.geometry.coordinates[0], unit.location.geometry.coordinates[1])) {
      let pulsar = true;
      const markerTimer = setInterval(() => {
        this.userMarker.getElement().hidden = pulsar;
        pulsar = !pulsar;
      }, 500);
      setTimeout(() => {
        clearInterval(markerTimer);
        this.userMarker.getElement().hidden = false;
      }, 6000);
      // } else {
      //   this.ownUnitsSource.forEach((feature: Feature) => {
      //     if (feature.id === unit.id) {
      //       console.log('Triggered!');
      //       // let pulsar = true;
      //       // const markerTimer = setInterval(() => {
      //       //   feature.getElement().hidden = pulsar;
      //       //   pulsar = !pulsar;
      //       // }, 500);
      //       // setTimeout(() => {
      //       //   clearInterval(markerTimer);
      //       //   feature.getElement().hidden = false;
      //       // }, 6000);
      //     }
      //   });
    }
  }

  openUnitInfoCardDialog(unit: Unit) {
    this.openUnitInfoService.open(unit);
  }

  ngOnDestroy() {
  }

  // createUnitMarker(unit: Unit) {
  //   const markerHeight = 50, markerRadius = 10, linearOffset = 25;
  //   const popupOffsets = {
  //     'top': new Point(0, 40),
  //     'top-left': new Point(0, 0),
  //     'top-right': new Point(0, 0),
  //     'bottom': new Point(0, 10),
  //     'bottom-left': new Point(0, 0),
  //     'bottom-right': new Point(0, 0),
  //     'left': new Point(0, 0),
  //     'right': new Point(0, 0)
  //   };
  //   const popup = new mapboxgl.Popup();
  //   const outerCircle = this.renderer.createElement('div');
  //   // adding outerCircle click listener
  //   outerCircle.addEventListener('click', () => {
  //     if (unitMarker.getPopup().isOpen()) {
  //       unitMarker.togglePopup();
  //     }
  //     this.openUnitInfoCardDialog(unit);
  //   });
  //   const unitMarker = new Marker(outerCircle);
  //   this.renderer.setAttribute(outerCircle, 'class', 'private_unit_marker_out');
  //   const innerCircle = this.renderer.createElement('div');
  //   (unit.paid && unit.enabled) ?
  //     this.renderer.setAttribute(innerCircle, 'class', 'private_unit_marker_in_active') :
  //     this.renderer.setAttribute(innerCircle, 'class', 'private_unit_marker_in_passive');
  //   outerCircle.appendChild(innerCircle);
  //
  //   // adding mouseenter listener
  //   let timer: any;
  //   let isMouseOnPopup = false;
  //   outerCircle.addEventListener('mouseenter', () => {
  //     if (!unitMarker.getPopup()) {
  //       // adding popups mouseenter listener
  //       const div = this.renderer.createElement('div');
  //       this.renderer.setStyle(div, 'cursor', 'pointer');
  //       div.addEventListener('mouseenter', () => isMouseOnPopup = true);
  //
  //       // adding popups mouselive listener
  //       div.addEventListener('mouseleave', () => {
  //         isMouseOnPopup = false;
  //         if (unitMarker.getPopup().isOpen()) {
  //           unitMarker.togglePopup();
  //         }
  //       });
  //       // adding popups click listener
  //       div.addEventListener('click', () => {
  //         isMouseOnPopup = false;
  //         if (unitMarker.getPopup().isOpen()) {
  //           unitMarker.togglePopup();
  //         }
  //         this.openUnitInfoCardDialog(unit);
  //       });
  //       div.innerHTML =
  //         '<div>\n' +
  //         '<img src=' +
  //         (unit.images[0] ? 'data:image/jpg;base64,' + unit.images[0].value
  //           : 'assets/pics/unit_pic_spacer-500x333.png')
  //         + ' width="80">\n' +
  //         '<div style="display: inline-block">\n' +
  //         '<p>' + unit.model + '</p>\n' +
  //         '</div></div>';
  //       unitMarker.setPopup(popup.setDOMContent(div)
  //         .on('open', e => {
  //           this.isPopupOpened = true;
  //         }));
  //     }
  //     timer = setTimeout(() => {
  //       if (!unitMarker.getPopup().isOpen()) {
  //         unitMarker.togglePopup();
  //       }
  //     }, 500);
  //   });
  //
  //   // adding mouseleave listener
  //   outerCircle.addEventListener('mouseleave',
  //     () => {
  //       if (!unitMarker.getPopup().isOpen()) {
  //         clearTimeout(timer);
  //       }
  //       if (unitMarker.getPopup().isOpen()) {
  //         setTimeout(() => {
  //           clearTimeout(timer);
  //           if (!isMouseOnPopup) {
  //             unitMarker.togglePopup();
  //           }
  //         }, 500);
  //       }
  //     });
  //   unitMarker.setLngLat([
  //     unit.location.geometry.coordinates[0],
  //     unit.location.geometry.coordinates[1]
  //   ]);
  //   return unitMarker;
  // }

  createUserMarker(user: User) {

    const popup = new mapboxgl.Popup({closeButton: false, offset: 10});
    popup.on('open', e => {
      this.isPopupOpened = true;
    });
    const markerDiv = this.renderer.createElement('div');
    this.renderer.setStyle(markerDiv, 'cursor', 'pointer');
    this.renderer.setAttribute(markerDiv, 'class', 'own_user_rectangle');
    markerDiv.innerHTML = 'P';
    const userLoc = this.currentUser.location.geometry.coordinates as number[];
    this.currentUser.units.forEach(unit => {
      const unitLoc = unit.location.geometry.coordinates as number[];
      if (userLoc[0] === unitLoc[0] && userLoc[1] === unitLoc[1]) {
        markerDiv.innerHTML = 'P+';
      }
    });
    this.userMarker = new Marker(markerDiv);

    // adding mouseenter listener
    let timer: any;
    let isMouseOnPopup = false;
    markerDiv.addEventListener('mouseenter', () => {
      if (!this.userMarker.getPopup()) {
        // adding popups mouseenter listener
        const div = this.renderer.createElement('div');
        this.renderer.setStyle(div, 'cursor', 'pointer');
        div.addEventListener('mouseenter', () => isMouseOnPopup = true);

        // adding popups mouselive listener
        div.addEventListener('mouseleave', () => {
          isMouseOnPopup = false;
          if (this.userMarker.getPopup().isOpen()) {
            this.userMarker.togglePopup();
          }
        });
        // adding popups click listener
        div.addEventListener('click', () => {
          isMouseOnPopup = false;
          if (this.userMarker.getPopup().isOpen()) {
            this.userMarker.togglePopup();
          }
          // this.openUnitInfoCardDialog(user);
        });
        div.innerHTML =
          '<div>\n' +
          '<img src=' +
          (user.image ? 'data:image/jpg;base64,' + user.image.value
            : 'assets/pics/buldozer_.jpg')
          + ' width="80">\n' +
          '<div style="display: inline-block">\n' +
          '<p>' + user.name + '</p>\n' +
          '</div></div>';
        this.userMarker.setPopup(popup.setDOMContent(div)
          .on('open', e => {
            this.isPopupOpened = true;
          }));
      }
      timer = setTimeout(() => {
        if (!this.userMarker.getPopup().isOpen()) {
          this.userMarker.togglePopup();
        }
      }, 500);
    });

    // adding mouseleave listener
    markerDiv.addEventListener('mouseleave',
      () => {
        if (!this.userMarker.getPopup().isOpen()) {
          clearTimeout(timer);
        }
        if (this.userMarker.getPopup().isOpen()) {
          setTimeout(() => {
            clearTimeout(timer);
            if (!isMouseOnPopup) {
              this.userMarker.togglePopup();
            }
          }, 500);
        }
      });


    // el.addEventListener('click', () => {
    //   if (this.userMarker.getPopup().isOpen()) {
    //     this.userMarker.togglePopup();
    //   }
    // });

    this.userMarker.setLngLat([
      this.currentUser.location.geometry.coordinates[0],
      this.currentUser.location.geometry.coordinates[1]])
      .addTo(this.map);
  }

  loadDataOnMoveend() {
    const currentViewportFromMap = _helpers.polygon([[
      this.map.getBounds().getNorthEast().toArray(),
      this.map.getBounds().getSouthEast().toArray(),
      this.map.getBounds().getSouthWest().toArray(),
      this.map.getBounds().getNorthWest().toArray(),
      this.map.getBounds().getNorthEast().toArray()]]);
    const currentViewportFromMapMultiP = <Feature<MultiPolygon>> turf.multiPolygon(
      [currentViewportFromMap.geometry.coordinates]);

    // init viewportMultiPolygons
    if (this.viewportMultiPolygons.geometry.coordinates.length === 0) {
      this.viewportMultiPolygons.geometry.coordinates.push(
        currentViewportFromMap.geometry.coordinates);
    }

    // add if not intersect
    if (!turf.difference(currentViewportFromMapMultiP, this.viewportMultiPolygons)
      && !turf.booleanEqual(currentViewportFromMapMultiP, this.viewportMultiPolygons)) {
      currentViewportFromMapMultiP.geometry.coordinates.forEach(coord => {
        this.viewportMultiPolygons.geometry.coordinates.push(coord);
      });
    }

    // should do request?
    // if equal, full outside or overlapsing
    let isContain = false;
    this.viewportMultiPolygons.geometry.coordinates.forEach(coord => {
      const poly = turf.polygon(coord);
      if (turf.booleanContains(poly, currentViewportFromMap)) {
        isContain = true;
      }
    });
    if (!isContain ||
      (turf.booleanEqual(this.viewportMultiPolygons, currentViewportFromMapMultiP)
        && this.isViewportFirstLoading)) {
      const oldViewportMultiPolygon = turf.clone(this.viewportMultiPolygons);
      if (!this.isViewportFirstLoading) {
        this.viewportMultiPolygons.geometry.coordinates.push(currentViewportFromMap.geometry.coordinates);
        this.viewportMultiPolygons = turf.clone(this.joinPolygons(this.viewportMultiPolygons));
      }

      // query
      let queryPolygon: Feature<MultiPolygon>;
      if (turf.booleanEqual(oldViewportMultiPolygon, this.viewportMultiPolygons)) {
        queryPolygon = this.viewportMultiPolygons;
      } else {
        queryPolygon = <Feature<MultiPolygon>>turf.difference(this.viewportMultiPolygons,
          oldViewportMultiPolygon);
      }

      this.parkService.loadDataOnMoveEnd(queryPolygon).subscribe(data => {
        console.log(data);
      });

      if (this.viewportSource) {
        this.viewportSource.setData(this.viewportMultiPolygons);
      }
      if (this.queryViewportSource) {
        this.queryViewportSource.setData(queryPolygon);
      }
      this.isViewportFirstLoading = false;
    }
  }

  joinPolygons(mp: Feature<MultiPolygon>): Feature<MultiPolygon> {
    // console.log('simplefyPoly inn: \n' + JSON.stringify(mp));
    if (mp && mp.geometry.coordinates.length > 1) {
      const seporatePolygonCollection = turf.multiPolygon([]);
      let joinedPolygon = turf.polygon(mp.geometry.coordinates[0]);
      let stop = true;
      mp.geometry.coordinates.forEach((coord) => {
        const poly = turf.polygon(coord);
        if (!turf.booleanEqual(joinedPolygon, poly) &&
          turf.intersect(joinedPolygon, poly)) {
          joinedPolygon = turf.clone(<Feature<Polygon>>turf.union(joinedPolygon, <Feature<Polygon>>poly));
          stop = false;
        }
        if (!turf.booleanEqual(joinedPolygon, poly) &&
          !turf.intersect(joinedPolygon, poly)) {
          seporatePolygonCollection.geometry.coordinates.push(coord);
        }
      });
      seporatePolygonCollection.geometry.coordinates.push(joinedPolygon.geometry.coordinates);
      if (!stop) {
        return this.joinPolygons(seporatePolygonCollection);
      }
      // console.log('simplefyPoly out: \n' + JSON.stringify(seporatePolygonCollection));
      return seporatePolygonCollection;
    } else {
      // console.log('simplefyPoly out mp.features.length <= 1: \n' + JSON.stringify(mp));
      return mp;
    }
  }
}

