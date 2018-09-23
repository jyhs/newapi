module.exports = class extends think.Logic {
  sendVerificationAction() {
    this.rules = {
      phone: {mobile: 'zh-CN', required: true, trim: true}
    };
  }
};
