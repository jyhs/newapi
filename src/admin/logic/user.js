module.exports = class extends think.Logic {
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: {int: true, required: true, trim: true},
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
      userId: { required: true, int: true, trim: true }
    };
  }
  getCartListAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: { required: true, int: true, trim: true }
    };
  }
  deleteCartAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: { required: true, int: true, trim: true }
    };
  }

  getLikeMaterialAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: { required: true, int: true, trim: true }
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
      userId: { required: true, int: true, trim: true },
      password: {string: true, required: true, trim: true, length: {min: 1, max: 20}}
    };
  }

  registerAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, required: true, trim: true},
      password1: {string: true, required: true, trim: true, length: {min: 1, max: 20}},
      password2: {string: true, required: true, trim: true, length: {min: 1, max: 20}},
      phone: {mobile: 'zh-CN', required: true, trim: true}
    };
  }
};
