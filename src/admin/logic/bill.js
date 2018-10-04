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
    this.rules = {
      bill_id: {int: true, required: true, trim: true}
    };
  }
};
