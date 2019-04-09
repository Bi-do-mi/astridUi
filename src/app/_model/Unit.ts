import {GeoJson} from './MarkerSourceModel';

export class Unit {
  id: number;
  ounerId: number;
  brand: string;
  model: string;
  subModel: string;
  location: GeoJson;
  enabled: boolean;
}
