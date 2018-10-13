module.exports = class extends think.Logic {
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      province: {string: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, trim: true}
    };
  }
  getAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, trim: true}
    };
  }
};
