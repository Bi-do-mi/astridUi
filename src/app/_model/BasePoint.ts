import {User} from './User';
import {Point} from 'mapbox-gl';

export class BasePoint {
  id: number;
  user: User;
  point: Point;
}
