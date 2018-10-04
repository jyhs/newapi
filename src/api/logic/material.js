module.exports = class extends think.Logic {
  checkNameAction() {
    this.rules = {
      name: {string: true, required: true, trim: true}
    };
  }
  focusAction() {
    this.rules = {
      user_id: {int: true, required: true, trim: true},
      material_id: {int: true, required: true, trim: true}
    };
  }
  focusListAction() {
    this.rules = {
      user_id: {int: true, required: true, trim: true}
    };
  }
  getAction() {
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  imageAction() {
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  imageSmallAction() {
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  imageListAction() {
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  typeAction() {
    this.rules = {
      category: {string: true, trim: true}
    };
  }
  listAction() {
    this.rules = {
      page: {int: true, required: true, trim: true},
      size: {int: true, required: true, trim: true},
      name: {string: true, trim: true},
      type: {string: true, trim: true},
      category: {string: true, trim: true},
      classification: {int: true, default: 0}
    };
  }
  randomListAction() {
    this.rules = {
      page: {int: true, required: true, trim: true},
      size: {int: true, required: true, trim: true},
      number: {int: true, trim: true},
      classification: {int: true, default: 0}
    };
  }
};
