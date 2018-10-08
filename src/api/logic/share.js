module.exports = class extends think.Logic {
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      param: {string: true, required: true, trim: true},
      encryptedData: {string: true, required: true, trim: true},
      iv: {string: true, required: true, trim: true}
    };
  }
  selectAction() {
    this.allowMethods = 'post';
    this.rules = {
      user_id: {int: true, required: true, trim: true},
      param: {string: true, required: true, trim: true},
      date: {date: true, required: true, trim: true}
    };
  }
};
