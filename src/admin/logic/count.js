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
};
