module.exports = class extends think.Logic {
  loginByCodeAction() {
    this.allowMethods = 'post';
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
      isError: { boolean: true }
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

  registerAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, required: true, trim: true},
      password1: {string: true, required: true, trim: true, length: {min: 6, max: 20}},
      password2: {string: true, required: true, trim: true, length: {min: 6, max: 20}},
      phone: {mobile: 'zh-CN', required: true, trim: true},
      requestId: {string: true, required: true, trim: true},
      auth: {string: true, required: true, trim: true}
    };
  }

  checkNameAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, required: true, trim: true}
    };
  }

  getAvatarAction() {
    this.rules = {
      userId: {int: true, required: true, trim: true}
    };
  }
};
