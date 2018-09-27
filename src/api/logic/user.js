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

  getAvatarAction() {
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
      id: { required: true, int: true },
      password: {string: true, required: true, trim: true, length: {min: 6, max: 20}}
    };
  }
  checkNamedAction() {
    this.rules = {
      name: {string: true, required: true, trim: true}
    };
  }
};
