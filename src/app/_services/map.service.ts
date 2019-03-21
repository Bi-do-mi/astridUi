import {Injectable, OnDestroy, OnInit} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {NGXLogger} from 'ngx-logger';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {User} from '../_model/User';
import {SnackBarService} from './snack-bar.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {GeoJson} from '../_model/MarkerSourceModel';


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
    source: any;
    markers: any;
  };
  private _isFirstLoading: boolean;
  private _mapTemplateId$ = new BehaviorSubject<string>('');
  currentMapId = this._mapTemplateId$.asObservable();
  private clickedPoint$ = new Subject<GeoJson>();
  private _clickedPoint = this.clickedPoint$.asObservable();

  constructor(private logger: NGXLogger,
              private snackBarService: SnackBarService,
              private http: HttpClient) {
    this._mapOps = {
      lng: 37.622504,
      lat: 55.753215,
      zoom: 9,
      source: null,
      markers: null
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
          /// Add map controls
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
            this.clickedPoint$.next(p);
          });
          this.navigatorCheck();
        }, 10);
      }
    });
  }

  ngOnInit() {
    // this._mapOps.markers = this.mapService.getMarkers()
    // this.initializeMap()
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
    this._mapOps.source = null;
    this._mapOps.markers = null;
  }

  // getPoint() {
  //   let point: Point;
  //   this.map.once('click', (event) => {
  //     point = new Point(event.lngLat.lng.toPrecision(8),
  //       event.lngLat.lat.toPrecision(8));
  //   });
  //   this.clickedPoint$.next(point);
  // }

  // //// Add Marker on Click
  // this.map.on('click', (event) => {
  //   const coordinates = [event.lngLat.lng, event.lngLat.lat];
  //   const newMarker = new GeoJson(coordinates);
  //   const point = new mapboxgl.Point(event.lngLat.lng, event.lngLat.lat);
  //   this.mapService.createMarker(point);
  // });

  // this.map.on('load', (event) => {
  //   this.map.addSource('markerSource',
  //     {
  //       type: 'geojson',
  //       data: {
  //         type: 'FeatureCollection',
  //         features: []
  //       }
  //     });
  // });

  // /// get source
  // this.source = this.map.getSource('markerSource');
  //
  // /// subscribe to realtime database and set data source
  // this.markers.pipe(untilDestroyed(this)).subscribe(markers => {
  //   const data = new FeatureCollection(markers);
  //   this.source.setData(data);
  // });

  // /// create map layers with realtime data
  // this.map.addLayer({
  //   id: 'markerSourceID',
  //   source: 'markerSource',
  //   type: 'symbol',
  //   layout: {
  //     'text-field': '{message}',
  //     'text-size': 24,
  //     'text-transform': 'uppercase',
  //     'icon-image': 'rocket-15',
  //     'text-offset': [0, 1.5]
  //   },
  //   paint: {
  //     'text-color': '#f16624',
  //     'text-halo-color': '#fff',
  //     'text-halo-width': 2
  //   }
  // });


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

  set mapTemplateId$(value: string) {
    this._mapTemplateId$.next(value);
  }


  get clickedPoint(): Observable<GeoJson> {
    return this._clickedPoint;
  }

// getMarkers(): Observable<any> {
  //   return this.http.get<any>('rest/markers/all');
  // }
  //
  // createMarker(point: Point) {
  //   const wkt = 'POINT(' + point.x + ' ' + point.y + ')';
  //   console.log(wkt);
  //   this.http.get('https://geocoder.tilehosting.com/r/' + point.x + '/' + point.y + '.js?key=hg1h55E0Z3ft5je5zeKI')
  //     .pipe(untilDestroyed(this)).subscribe(stname => {
  //       console.log(stname);
  //     });
  //   return this.http.put<any>('rest/geo/create-markers', wkt)
  // .pipe(untilDestroyed(this)).subscribe(data => {
  //     console.log(data);
  //   }, error => {
  //     console.log(error);
  //     // throw error;
  //   });
  // }

  // removeMarker(marker: GeoJson) {
  //   return this.http.delete('rest/markers/delete-marker?id=' + marker.properties.id);
  // }

  ngOnDestroy() {
  }
}
