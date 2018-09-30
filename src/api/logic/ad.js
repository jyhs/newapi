module.exports = class extends think.Logic {
  addAction() {
    this.rules = {
      province: {string: true, required: true, trim: true}
    };
  }
};
