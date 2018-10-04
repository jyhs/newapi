module.exports = class extends think.Logic {
  addAction() {
    this.rules = {
      name: {string: true, required: true, trim: true},
      size: {string: true, required: true, trim: true},
      recommend: {string: true, trim: true},
      price: {int: true, required: true, trim: true},
      point: {int: true, required: true, trim: true},
      numbers: {int: true, trim: true, default: 99},
      limits: {int: true, trim: true, default: 99},
      bill_id: {int: true, required: true, trim: true}
    };
  }
  deleteAction() {
    this.rules = {
      bill_detail_id: {int: true, required: true, trim: true}
    };
  }
  updateAction() {
    this.rules = {
      id: {int: true, required: true, trim: true},
      size: {string: true, trim: true},
      recommend: {string: true, trim: true},
      price: {int: true, trim: true},
      point: {int: true, trim: true},
      numbers: {int: true, trim: true},
      limits: {int: true, trim: true}
    };
  }
};
