module.exports = class extends think.Logic {
  updateAction() {
    this.rules = {
      id: {int: true, required: true, trim: true},
      city: {string: true, trim: true},
      province: {string: true, trim: true},
      phone: {mobile: 'zh-CN', trim: true},
      type: {string: true, trim: true},
      code: {string: true, trim: true},
      address: {string: true, trim: true},
      description: {string: true, trim: true},
      contacts: {string: true, trim: true},
      status: {int: true, trim: true},
      point: {int: true, trim: true}
    };
  }
};
