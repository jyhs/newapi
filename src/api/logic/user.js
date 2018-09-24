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

  getByIdAction() {
    this.rules = {
      id: { required: true, int: true }
    };
  }
};
