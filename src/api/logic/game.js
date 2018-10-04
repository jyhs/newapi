module.exports = class extends think.Logic {
  overAction() {
    this.rules = {
      level: {string: true, required: true, trim: true},
      title: {string: true, required: true, trim: true},
      time: {int: true, required: true, trim: true}
    };
  }
};
