import {Component, OnDestroy, OnInit} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {MapService} from '../../_services/map.service';
import {NGXLogger} from 'ngx-logger';
import {SnackBarService} from '../../_services/snack-bar.service';
import {FeatureCollection, GeoJson} from '../../_model/MarkerSourceModel';


@Component({
  selector: 'app-map-box',
  templateUrl: './map-box.component.html',
  styleUrls: ['./map-box.component.scss']
})

export class MapBoxComponent implements OnInit, OnDestroy {
  map: mapboxgl.Map;
  style: string;
  lng: number;
  lat: number;
  zoom: number;
  source: any;
  markers: any;

  constructor(private mapService: MapService, private logger: NGXLogger,
              public snackBarService: SnackBarService) {
    // this.logger.info('MapBoxComponent - constructor\n',
    //   this.mapService.mapOps, 'isFirstLoading: ', mapService.isFirstLoading);
  }

  ngOnInit() {
    // this.markers = this.mapService.getMarkers();
    // отступ по времени для правильного отображения карты
    setTimeout(() => {
      this.initializeMap();
    }, 10);
  }

  ngOnDestroy() {
    this.setMapOps(this.map);
  }

  private initializeMap() {
    this.getMapOps(this.mapService.mapOps);
    this.buildMap();
    if (navigator.geolocation && this.mapService.isFirstLoading) {
      // this.logger.info('MapBoxComponent - Navigator works!');
      navigator.geolocation.getCurrentPosition(position => {
          this.lng = position.coords.longitude;
          this.lat = position.coords.latitude;
          setTimeout(() => {
            this.map.flyTo({center: [this.lng, this.lat]});
          }, 1000);
        },
        error => {
          this.snackBarService.error('Ваш браузер заблокировал передачу геоданных', 'OK');
        });
    }
  }


  buildMap() {
    this.map = new mapboxgl.Map({
      container: 'map_container',
      style: this.style,
      zoom: this.zoom,
      center: [this.lng, this.lat]
    });

    /// Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {enableHighAccuracy: true}}));
    this.map.addControl(new mapboxgl.ScaleControl());
    this.map.addControl(new mapboxgl.FullscreenControl());

    //// Add Marker on Click
    this.map.on('click', (event) => {
      const coordinates = [event.lngLat.lng, event.lngLat.lat];
      const newMarker = new GeoJson(coordinates);
      const point = new mapboxgl.Point(event.lngLat.lng, event.lngLat.lat);
      this.mapService.createMarker(point);
    });

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
    // this.markers.subscribe(markers => {
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
  }

  private getMapOps(mapOps: {
    lng: number; lat: number;
    zoom: number; source: any; markers: any
  }) {
    this.style = this.mapService.style;
    this.lng = mapOps.lng;
    this.lat = mapOps.lat;
    this.zoom = mapOps.zoom;
  }

  private setMapOps(map: mapboxgl.Map) {
    const mapOps = {
      lng: map.getCenter().lng,
      lat: map.getCenter().lat,
      zoom: map.getZoom(),
      source: null,
      markers: null
    };
    this.mapService.mapOps = mapOps;
  }
}


