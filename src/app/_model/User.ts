import {Role} from './Role';
import {GeoJson} from './MarkerSourceModel';
import {ZonedDateTime} from 'js-joda';
import {Unit} from './Unit';
import {UserImage} from './UserImage';

export class User {
  id: number;
  name: string;
  roles: Role[];
  password: string;
  username: string;
  accountNonExpired = true;
  accountNonLocked = true;
  credentialsNonExpired = true;
  enabled = true;
  registrationDate: ZonedDateTime;
  lastVisit: ZonedDateTime;
  phoneNumber: string;
  location: GeoJson;
  units: Unit[];
  image: UserImage;

  hasUnit(id: number): boolean {
    if (this.units && this.units.length > 0) {
      this.units.forEach((u: Unit) => {
        if (u.id === id) {
          return true;
        }
      });
    }
    return false;
  }
}
