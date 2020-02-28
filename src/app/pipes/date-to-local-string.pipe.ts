import {Pipe, PipeTransform} from '@angular/core';
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';
import {User} from '../_model/User';
import {Observable, of} from 'rxjs';

@Pipe({
  name: 'dateToLocaleString'
})
export class DateToLocalStringPipe implements PipeTransform {

  transform(value: any): Observable<string> {
    return of(value.format(
      DateTimeFormatter.ofPattern('dd.MM.yyy')).toString());
  }

}
