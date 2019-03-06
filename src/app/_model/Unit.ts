import {BasePoint} from './BasePoint';

export class Unit {
  id: number;
  ounerId: number;
  brand: string;
  model: string;
  subModel: string;
  location: BasePoint;
  enabled: boolean;
}
