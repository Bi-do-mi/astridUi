import {Component, Input, OnInit} from '@angular/core';
import {Unit} from '../../_model/Unit';
import {ParkService} from '../../_services/park.service';
import {Duration, ZonedDateTime} from '@js-joda/core';
import {environment} from '../../../environments/environment.prod';

@Component({
  selector: 'app-units-popup',
  templateUrl: './units-popup.component.html',
  styleUrls: ['./units-popup.component.scss']
})
export class UnitsPopupComponent implements OnInit {
  private _unit: Unit;
  period: any;
  progress: number;
  background: string;

  constructor(private parkService: ParkService) {
  }

  ngOnInit() {
    if (this._unit.images && this._unit.images.length > 0 && (!this._unit.images[0].value)) {
      this.parkService.loadUnitImgFromServer(this._unit).subscribe((data: Unit) => {
        this._unit.images = data.images;
      });
    }
    if (this.unit.workEnd) {
      this.period = Duration.between(this.unit.workEnd, ZonedDateTime.now()).toDays() * (-1);
      this.progress = this.period * 100 / environment.workEndPeriod;
      switch (true) {
        case (this.progress > 50): {
          this.background = 'green';
          break;
        }
        case (this.progress < 50 && this.progress > 30): {
          this.background = 'orange';
          break;
        }
        default: {
          this.background = 'red';
        }
      }
    }
  }

  @Input()
  set unit(unit: Unit) {
    this._unit = unit;
  }

  get unit(): Unit {
    return this._unit;
  }
}
