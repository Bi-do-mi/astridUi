import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
  style = 'https://maps.tilehosting.com/styles/basic/style.json?key=VRgdrAzvUsWnu6iigRja';
  lat = 37.622504;
  lng = 55.753215;
  zoom = 9;
  source: any;
  markers: any;

  constructor(private mapService: MapService, private logger: NGXLogger) {
    this.map = mapService.map;
  }

  ngOnInit() {
    if (!this.map) {
      this.initializeMap();
      // this.logger.info('map initializing ' + this.map.getContainer().getAttribute('id'));
      this.mapService.map = this.map;
    }
  }

  ngOnDestroy() {
    this.mapService.map = this.map;
  }

  private initializeMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.map.flyTo({
          center: [this.lng, this.lat]
        });
      });
    }
    this.buildMap();
  }

  buildMap() {
    this.map = new mapboxgl.Map({
      container: 'map_container',
      style: this.style,
      zoom: this.zoom,
      center: [this.lng, this.lat]
    });

    /// Add map controls
    this.map.addControl(new mapboxgl.NavigationControl(),);

  }
}
