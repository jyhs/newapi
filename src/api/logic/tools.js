module.exports = class extends think.Logic {
  sendVerificationAction() {
    this.allowMethods = 'post';
    this.rules = {
      phone: {mobile: 'zh-CN', required: true, trim: true}
    };
  }
  getCityByPhoneAction() {
    this.allowMethods = 'post';
    this.rules = {
      phone: {mobile: 'zh-CN', required: true, trim: true}
    };
  }
  getUserByTokenAction() {
    this.allowMethods = 'post';
    this.rules = {
      token: {string: true, required: true, trim: true}
    };
  }
};
