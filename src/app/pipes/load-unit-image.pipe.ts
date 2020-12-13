import {OnDestroy, Pipe, PipeTransform} from '@angular/core';
import {ParkService} from '../_services/park.service';
import {map} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {Unit} from '../_model/Unit';
import {environment} from '../../environments/environment';
import {of} from 'rxjs';

@Pipe({name: 'loadUnitImg'})
export class LoadUnitImagePipe implements PipeTransform, OnDestroy {


  constructor(private parkService: ParkService) {
  }

  transform(unit: Unit): any {
    if (unit.images[0]) {
      if (!unit.images[0].value) {
        return this.parkService.loadUnitImgFromServer(unit)
          .pipe(untilDestroyed(this),
            map((un: Unit) => {
              unit.images[0] = un.images[0];
              return ('data:image/jpg;base64,' + unit.images[0].value);
            }, er => {
              console.log('LoadUnitImagePipe error:\n' + er);
            }));
      }
      if (unit.images[0].value) {
        return of('data:image/jpg;base64,' + unit.images[0].value);
      }
    } else {
        return of(environment.unitPicSpacer);
    }
  }

  ngOnDestroy() {
  }
}
