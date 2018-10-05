module.exports = class extends think.Logic {
  getNumberAction() {
    this.allowMethods = 'post';
    this.rules = {
      province: {string: true, required: true, trim: true}
    };
  }
};
