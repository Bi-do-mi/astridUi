import {Component, OnDestroy, OnInit} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {MapService} from '../../_services/map.service';
import {NGXLogger} from 'ngx-logger';


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

  constructor(private mapService: MapService, private logger: NGXLogger) {
    // this.logger.info('MapBoxComponent - constructor\n',
    //   this.mapService.mapOps, 'isFirstLoading: ', mapService.isFirstLoading);
  }

  ngOnInit() {
    this.initializeMap();
    // this.logger.info('map initializing ' + this.map.getContainer().getAttribute('id'));
    // this.setMapOps(this.map);
    // this.logger.info('MapBoxComponent - ngOnInit, ');
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
      positionOptions: {
        enableHighAccuracy: true
      }
    }));
    this.map.addControl(new mapboxgl.ScaleControl());
    this.map.addControl(new mapboxgl.FullscreenControl());
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
