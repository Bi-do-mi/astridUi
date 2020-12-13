import {OnDestroy, Pipe, PipeTransform} from '@angular/core';
import {ParkService} from '../_services/park.service';
import {map} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {environment} from '../../environments/environment';
import {of} from 'rxjs';
import {User} from '../_model/User';

@Pipe({name: 'loadUserImg'})
export class LoadUserImagePipe implements PipeTransform, OnDestroy {


  constructor(private parkService: ParkService) {
  }

  transform(user: User): any {
    if (user.image) {
      if (!user.image.value) {
        return this.parkService.loadUsersImgFromServer(user)
          .pipe(untilDestroyed(this),
            map((us: User) => {
              user.image = us.image;
              return ('data:image/jpg;base64,' + user.image.value);
            }, er => {
              console.log('LoadUnitImagePipe error:\n' + er);
            }));
      }
      if (user.image.value) {
        return of('data:image/jpg;base64,' + user.image.value);
      }
    } else {
        return of(environment.userPicSpacer);
    }
  }

  ngOnDestroy() {
  }
}
