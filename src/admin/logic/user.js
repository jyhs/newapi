module.exports = class extends think.Logic {
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      user_id: {int: true, required: true, trim: true},
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
  getByIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      user_id: { required: true, int: true }
    };
  }

  getByTypeAction() {
    this.allowMethods = 'post';
    this.rules = {
      type: { required: true, string: true, trim: true },
      city: { string: true, trim: true }
    };
  }

  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      city: {string: true, trim: true},
      province: {string: true, trim: true},
      type: {string: true, trim: true}
    };
  }

  uploadAvatarAction() {
    this.allowMethods = 'post';
    this.rules = {
      avatar: {method: 'file', required: true}
    };
  }

  changPasswordAction() {
    this.allowMethods = 'post';
    this.rules = {
      password: {string: true, required: true, trim: true, length: {min: 6, max: 20}}
    };
  }
};
