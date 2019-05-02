import {ZonedDateTime} from 'js-joda';

export class UnitModel {
  modelmame = '';
  createdOn: ZonedDateTime;

  toJSON() {
    return ({
      modelname: this.modelmame,
      createdOn: this.createdOn
    });
  }
}

export class UnitBrend {
  brendname = '';
  models = new Set<string>();
  createdOn: ZonedDateTime;

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
