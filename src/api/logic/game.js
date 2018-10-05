module.exports = class extends think.Logic {
  overAction() {
    this.allowMethods = 'post';
    this.rules = {
      level: {string: true, required: true, trim: true},
      title: {string: true, required: true, trim: true},
      time: {int: true, required: true, trim: true}
    };
  }
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      size: {int: true, required: true, trim: true, default: 50}
    };
  }
};
