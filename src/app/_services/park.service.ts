import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {finalize, first, map} from 'rxjs/operators';
import {UnitAssignment} from '../_model/UnitsList';
import {Unit} from '../_model/Unit';
import {NgxSpinnerService} from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class ParkService {

  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService,
  ) {
    this.getJSONfromFile();
  }

  public getJSONfromFile() {
    return this.http.get('./assets/ParkList/list.json').pipe(
      map(data => {
        const allText: string = JSON.stringify(data);
        return data = JSON.parse(allText);
      }));
  }

  createUnit(unit: Unit) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.post<any>('rest/units/create_unit', unit)
      .pipe(finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }));
  }
}
