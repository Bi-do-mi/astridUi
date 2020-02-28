import {GeoJson} from './MarkerSourceModel';
import {UnitImage} from './UnitImage';
import {UnitOptionModel} from '../components/unit-create-dialog/UnitOptions/UnitOptionModel';
import {ZonedDateTime} from '@js-joda/core';

export class Unit {
  id: number;
  ownerId: number;
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
