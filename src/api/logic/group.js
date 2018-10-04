module.exports = class extends think.Logic {
  listAction() {
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  deleteAction() {
    this.rules = {
      id: {int: true, trim: true}
    };
  }
  getAction() {
    this.rules = {
      id: {int: true, trim: true}
    };
  }
};
