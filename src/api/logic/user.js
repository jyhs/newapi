module.exports = class extends think.Logic {
  loginByCodeAction() {
    this.rules = {
      code: { required: true, string: true }
    };
  }

  loginByPasswordAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: { required: true, string: true, trim: true },
      password: { required: true, string: true, trim: true },
      auth: { string: true, trim: true },
      requestId: { string: true },
      is_error: { boolean: true }
    };
  }

  forgetPasswordAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: { required: true, string: true, trim: true },
      auth: { string: true, required: true, trim: true },
      requestId: { string: true, required: true },
      phone: {mobile: 'zh-CN', required: true, trim: true}
    };
  }

  getByIdAction() {
    this.rules = {
      id: { required: true, int: true }
    };
  }

  listAction() {
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      city: {string: true, trim: true},
      province: {string: true, trim: true},
      type: {string: true, trim: true}
    };
  }

  registerAction() {
    this.rules = {
      name: {string: true, required: true, trim: true},
      city: {string: true, trim: true},
      province: {string: true, trim: true},
      password1: {string: true, required: true, trim: true, length: {min: 6, max: 20}},
      password2: {string: true, required: true, trim: true, length: {min: 6, max: 20}},
      phone: {mobile: 'zh-CN', required: true, trim: true},
      requestId: {string: true, required: true, trim: true},
      auth: {string: true, required: true, trim: true}
    };
  }

  updateAction() {
    this.rules = {
      id: { required: true, int: true, trim: true },
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

  getAvatarAction() {
    this.rules = {
      id: { required: true, int: true }
    };
  }

  uploadAvatarAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true},
      avatar: {method: 'file', required: true}
    };
  }

  logoutAction() {
    this.rules = {
      id: { required: true, int: true }
    };
  }

  getByTypeAction() {
    this.rules = {
      type: { required: true, string: true, trim: true },
      city: { string: true, trim: true }
    };
  }

  bindPhoneAction() {
    this.rules = {
      id: { required: true, int: true },
      phone: {mobile: 'zh-CN', required: true, trim: true}
    };
  }

  checkPhoneAction() {
    this.rules = {
      id: { required: true, int: true }
    };
  }

  changPasswordAction() {
    this.rules = {
      password: {string: true, required: true, trim: true, length: {min: 6, max: 20}}
    };
  }
  checkNamedAction() {
    this.rules = {
      name: {string: true, required: true, trim: true}
    };
  }
};
