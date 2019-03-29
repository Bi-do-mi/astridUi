import {Role} from './Role';
import {GeoJson} from './MarkerSourceModel';
import {ZonedDateTime} from 'js-joda';

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
}
