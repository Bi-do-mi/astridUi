import {Point} from 'mapbox-gl';


export class Unit {
  id: number;
  ounerId: number;
  brand: string;
  model: string;
  subModel: string;
  location: Point;
  enabled: boolean;
}
