module.exports = class extends think.Logic {
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true, default: '礁岩海水团长单'},
      supplier_id: {int: true, required: true, trim: true},
      effort_date: {date: true, required: true},
      bill: {method: 'file', required: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      bill_id: {int: true, required: true, trim: true}
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
      bill_id: {int: true, required: true, trim: true}
    };
  }
  detailDeleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      bill_detail_id: {int: true, required: true, trim: true}
    };
  }
  detailUpdateAction() {
    this.allowMethods = 'post';
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
