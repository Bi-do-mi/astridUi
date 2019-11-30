import {Component, Input, OnInit} from '@angular/core';
import {Unit} from '../../_model/Unit';
import {ParkService} from '../../_services/park.service';

@Component({
  selector: 'app-units-popup',
  templateUrl: './units-popup.component.html',
  styleUrls: ['./units-popup.component.scss']
})
export class UnitsPopupComponent implements OnInit {
  private _unit: Unit;

  constructor(private parkService: ParkService) {
  }

  ngOnInit() {
    if (this._unit.images.length > 0 && (!this._unit.images[0].value)) {
      this.parkService.loadUnitImgFromServer(this._unit).subscribe((data: Unit) => {
        this._unit.images = data.images;
      });
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
