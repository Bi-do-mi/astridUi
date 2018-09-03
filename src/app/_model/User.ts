import {Role} from './Role';

export class User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
  password: string;
  username: string;
  accountNonExpired = true;
  accountNonLocked = true;
  credentialsNonExpired = true;
  enabled = true;
}
