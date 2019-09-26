import {GeoJson} from './MarkerSourceModel';
import {UnitImage} from './UnitImage';
import {ZonedDateTime} from 'js-joda';
import {UnitOptionModel} from '../components/unit-create-dialog/UnitOptions/UnitOptionModel';

export class Unit {
  id: number;
  ouner: number;
  type: string;
  brand: string;
  model: string;
  location: GeoJson;
  enabled: boolean;
  paid: boolean;
  testFor: boolean;
  images: UnitImage[] = [];
  createdOn: ZonedDateTime;
  lastUpdate: ZonedDateTime;
  paidUntil: ZonedDateTime;
  options: UnitOptionModel<any>[] = [];
}
