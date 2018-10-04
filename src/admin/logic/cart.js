module.exports = class extends think.Logic {
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      group_bill_id: {int: true, required: true, trim: true}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true},
      status: {int: true, trim: true},
      sum: {int: true, trim: true},
      is_confirm: {int: true, trim: true},
      freight: {float: true, trim: true},
      phone: {string: true, trim: true},
      address: {string: true, trim: true},
      province: {string: true, trim: true},
      city: {string: true, trim: true},
      contacts: {string: true, trim: true},
      description: {string: true, trim: true}
    };
  }
};
