module.exports = class extends think.Logic {
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      bill: {method: 'file', required: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      billId: {int: true, required: true, trim: true}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      billName: {string: true, trim: true},
      effortDate: {date: true, trim: true},
      description: {string: true, trim: true},
      supplierId: {int: true, trim: true},
      billId: {int: true, trim: true}
    };
  }
  detailAddAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, required: true, trim: true},
      size: {string: true, required: true, trim: true},
      recommend: {string: true, trim: true},
      price: {int: true, required: true, trim: true},
      point: {int: true, required: true, trim: true},
      numbers: {int: true, trim: true, default: 99},
      limits: {int: true, trim: true, default: 99},
      billId: {int: true, required: true, trim: true}
    };
  }
  detailDeleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      billDetailId: {int: true, required: true, trim: true}
    };
  }
  detailUpdateAction() {
    this.allowMethods = 'post';
    this.rules = {
      detailId: {int: true, required: true, trim: true},
      size: {string: true, trim: true},
      recommend: {string: true, trim: true},
      price: {int: true, trim: true},
      point: {int: true, trim: true},
      numbers: {int: true, trim: true},
      limits: {int: true, trim: true}
    };
  }
};
