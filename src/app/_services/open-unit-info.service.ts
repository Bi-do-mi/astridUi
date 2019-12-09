import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {Unit} from '../_model/Unit';
import {NgxGalleryImage} from 'ngx-gallery';
import {finalize, first} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {ParkService} from './park.service';

@Injectable({
  providedIn: 'root'
})
export class OpenUnitInfoService implements OnDestroy {
  private openUnitInfo$ = new Subject();
  openUnitInfo = this.openUnitInfo$.asObservable();

  constructor(private parkService: ParkService) {
  }

  ngOnDestroy() {
  }

  open(unit: Unit) {
    this.openUnitInfo$.next({unit});
  }

  getGallery(unit: Unit, gall: NgxGalleryImage[]): void {
    if (unit.images && unit.images.length > 0 && (!unit.images[0].value)) {
      this.parkService.loadUnitImgFromServer(unit)
        .pipe(first(), untilDestroyed(this), finalize(() => {
          this.fillGallery(unit, gall);
        }))
        .subscribe((data: Unit) => {
          unit = data;
        });
    } else {
      this.fillGallery(unit, gall);
    }
  }

  fillGallery(unit: Unit, gall: NgxGalleryImage[]): void {
    if (unit.images && unit.images.length > 0 && (unit.images[0].value)) {
      unit.images.forEach(i => {
        gall.push({
          small: 'data:image/jpg;base64,' + i.value,
          medium: 'data:image/jpg;base64,' + i.value,
          big: 'data:image/jpg;base64,' + i.value
        });
      });
    }
    if (unit.images.length === 0) {
      gall.push({
        small: 'assets/pics/unit_pic_spacer-600x400.png',
        medium: 'assets/pics/unit_pic_spacer-600x400.png',
        big: 'assets/pics/unit_pic_spacer-600x400.png'
      });
    }
  }
}
