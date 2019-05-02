import {GeoJson} from './MarkerSourceModel';
import {User} from './User';

export class Unit {
  id: number;
  ouner: number;
  assignment: string;
  type: string;
  brand: string;
  model: string;
  location: GeoJson;
  enabled: boolean;
  paid: boolean;
  testFor: boolean;
}
