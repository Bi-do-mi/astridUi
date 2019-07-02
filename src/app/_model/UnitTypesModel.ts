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

export class UnitBrand {
  brandname = '';
  models = new Set<UnitModel>();
  createdOn = ZonedDateTime.now(ZoneId.of('UTC'));

  toJSON() {
    return ({
      brandname: this.brandname,
      createdOn: this.createdOn,
      models: Array.from(this.models)
    });
  }
}

export class UnitType {
  typename = '';
  brandsmap = new Map<string, UnitBrand>();
  brands = new Set<UnitBrand>();

  toJSON() {
    return ({
      typename: this.typename,
      brands: Array.from(this.brands)
    });
  }
}


export class UnitAssignment {
  assignmentname = '';
  types = new Map<string, UnitType>();

  toJSON() {
    return ({
      assignmentname: this.assignmentname,
      types: Array.from(this.types)
    });
  }
}
