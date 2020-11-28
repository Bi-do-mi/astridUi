import {Component, OnDestroy, OnInit} from '@angular/core';
import {MapService} from '../../_services/map.service';
import {NGXLogger} from 'ngx-logger';
import {SnackBarService} from '../../_services/snack-bar.service';
import {Title} from '@angular/platform-browser';


@Component({
  selector: 'app-map-box',
  templateUrl: './map-box.component.html',
  styleUrls: ['./map-box.component.scss']
})

export class MapBoxComponent implements OnInit, OnDestroy {

  constructor(private mapService: MapService, private logger: NGXLogger,
              public snackBarService: SnackBarService,
              private titleService: Title) {
  }

  ngOnInit() {
    this.mapService.mapTemplateId$ = 'map_container';
    this.titleService.setTitle('"Технокарта" - бесплатный онлайн-сервис поиска спецтехники в аренду');
  }

  ngOnDestroy() {
    this.mapService.saveMapOps();
  }

}


