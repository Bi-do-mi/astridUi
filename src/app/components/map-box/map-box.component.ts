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

  constructor(private mapService: MapService, private logger: NGXLogger,
              public snackBarService: SnackBarService) {
  }

  ngOnInit() {
    this.mapService.mapTemplateId$ = 'map_container';
  }

  ngOnDestroy() {
    this.mapService.saveMapOps();
  }

}


