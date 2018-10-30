module.exports = class extends think.Logic {
  grossSalesAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: {int: true, trim: true}
    };
  }
  lastGrossSalesAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: {int: true, required: true, trim: true}
    };
  }
  groupByYearAction() {
    this.allowMethods = 'post';
    this.rules = {
      from: {string: true, required: true, trim: true},
      to: {string: true, required: true, trim: true}
    };
  }
};
