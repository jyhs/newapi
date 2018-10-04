module.exports = class extends think.Logic {
  listAction() {
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  getByIdAction() {
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
};
