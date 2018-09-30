module.exports = class extends think.Logic {
  addAction() {
    this.rules = {
      param: {string: true, required: true, trim: true},
      encryptedData: {string: true, required: true, trim: true},
      iv: {string: true, required: true, trim: true}
    };
  }
};
