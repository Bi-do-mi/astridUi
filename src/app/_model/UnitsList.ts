export class UnitBrend {
  brendname = '';
  models = new Array<string>();

  toJSON() {
    return ({
      brendname: this.brendname,
      models: this.models
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
