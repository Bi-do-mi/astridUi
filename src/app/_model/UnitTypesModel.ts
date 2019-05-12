import {ZonedDateTime, ZoneId} from 'js-joda';

export class UnitModel {
  modelname = '';
  createdOn = ZonedDateTime.now(ZoneId.of('UTC'));

  toJSON() {
    return ({
      modelname: this.modelname,
      createdOn: this.createdOn
    });
  }
}

export class UnitBrend {
  brendname = '';
  models = new Set<UnitModel>();
  createdOn = ZonedDateTime.now(ZoneId.of('UTC'));

  toJSON() {
    return ({
      brendname: this.brendname,
      createdOn: this.createdOn,
      models: Array.from(this.models)
    });
  }
}

export class UnitType {
  typename = '';
  brends = new Set<UnitBrend>();

  toJSON() {
    return ({
      typename: this.typename,
      brends: Array.from(this.brends)
    });
  }
}


export class UnitAssignment {
  assignmentname = '';
  types = new Set<UnitType>();

  toJSON() {
    return ({
      assignmentname: this.assignmentname,
      types: Array.from(this.types)
    });
  }
}
