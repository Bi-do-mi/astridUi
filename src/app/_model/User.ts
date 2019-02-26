import {Role} from './Role';
import {BasePoint} from './BasePoint';

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
  registrationDate: number;
  lastVisit: number;
  phoneNumber: string;
  basePoint: BasePoint;
}
