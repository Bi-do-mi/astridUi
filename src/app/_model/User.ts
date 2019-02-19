import {Role} from './Role';
import {BasePoint} from './BasePoint';

export class User {
  id: number;
  firstName: string;
  lastName: string;
  roles: Role[];
  parkName: string;
  password: string;
  username: string;
  accountNonExpired = true;
  accountNonLocked = true;
  credentialsNonExpired = true;
  enabled = true;
  registrationDate: number;
  lastVisit: number;
  phoneNumber: string;
  basePoint: BasePoint;
}
