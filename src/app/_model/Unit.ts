import {GeoJson} from './MarkerSourceModel';

export class Unit {
  id: number;
  ounerId: number;
  assignment: string;
  type: string;
  brand: string;
  model: string;
  location: GeoJson;
  enabled: boolean;
  paid: boolean;
  testFor: boolean;
}
