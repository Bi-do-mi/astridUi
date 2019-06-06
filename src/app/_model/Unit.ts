import {GeoJson} from './MarkerSourceModel';
import {User} from './User';
import {UnitImage} from './UnitImage';
import {ZonedDateTime} from 'js-joda';

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
  images: UnitImage[] = [];
  createdOn: ZonedDateTime;
  lastUpdate: ZonedDateTime;

  // toJSON() {
  //   return ({
  //     id: this.id,
  //     ouner: this.ouner,
  //     assignment: this.assignment,
  //     type: this.type,
  //     brand: this.brand,
  //     model: this.model,
  //     location: this.location,
  //     enabled: this.enabled,
  //     paid: this.paid,
  //     testFor: this.testFor,
  //     images: this.images,
  //     createdOn: this.createdOn,
  //     lastUpdate: this.lastUpdate
  //   });
  // }
}
