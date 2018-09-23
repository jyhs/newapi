module.exports = class extends think.Logic {
  loginByCodeAction() {
    this.rules = {
      code: { required: true, string: true },
      register: { boolean: true }
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
    if (this.post('is_error')) {
      const auth = this.post('auth');
      const code = this.cache(this.post('requestId'));
      if (think.isEmpty(code)) {
        this.fail('验证码失效');
      } else if (code !== auth) {
        this.fail('验证码不正确');
      }
    }
  }
};
