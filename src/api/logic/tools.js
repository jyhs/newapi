module.exports = class extends think.Logic {
  sendVerificationAction() {
    this.allowMethods = 'post';
    this.rules = {
      phone: {mobile: 'zh-CN', required: true, trim: true}
    };
  }
};
