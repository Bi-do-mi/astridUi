import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Unit} from '../_model/Unit';
import {NgxGalleryImage} from 'ngx-gallery';

@Injectable({
  providedIn: 'root'
})
export class OpenUnitInfoService {
  private openUnitInfo$ = new Subject();
  openUnitInfo = this.openUnitInfo$.asObservable();

  constructor() {
  }

  open(unit: Unit) {
    // console.log('!!!!');
    const gallery = this.getGallery(unit);
    this.openUnitInfo$.next({unit, gallery});
  }

  openWithLazyGallery(unit: Unit, gallery: NgxGalleryImage[]) {
    this.openUnitInfo$.next({unit, gallery});
  }

  getGallery(unit: Unit): NgxGalleryImage[] {
    const gallery: NgxGalleryImage[] = [];
    unit.images.forEach(i => {
      gallery.push({
        small: 'data:image/jpg;base64,' + i.value,
        medium: 'data:image/jpg;base64,' + i.value,
        big: 'data:image/jpg;base64,' + i.value
      });
    });
    return gallery;
  }
}
