module.exports = class extends think.Logic {
  grossSalesSummaryAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: {int: true, required: true, trim: true}
    };
  }
  groupByYearAction() {
    this.allowMethods = 'post';
    this.rules = {
      from: {date: true, required: true, trim: true},
      to: {date: true, required: true, trim: true},
      userId: {int: true, required: true, trim: true}
    };
  }
};
