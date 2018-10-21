module.exports = class extends think.Logic {
  checkNameAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, required: true, trim: true}
    };
  }
  focusAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: {int: true, required: true, trim: true},
      materialId: {int: true, required: true, trim: true}
    };
  }
  focusListAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: {int: true, required: true, trim: true}
    };
  }
  getAction() {
    this.allowMethods = 'post';
    this.rules = {
      materialId: {int: true, required: true, trim: true}
    };
  }
  getImageAction() {
    this.allowMethods = 'post';
    this.rules = {
      materialId: {int: true, required: true, trim: true}
    };
  }
  getImageSmallAction() {
    this.allowMethods = 'get';
    this.rules = {
      materialId: {int: true, required: true, trim: true}
    };
  }
  typeAction() {
    this.allowMethods = 'post';
    this.rules = {
      category: {string: true, trim: true}
    };
  }
  listAction() {
    this.allowMethods = 'post';
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
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, required: true, trim: true},
      size: {int: true, required: true, trim: true},
      classification: {int: true, default: 0}
    };
  }
  randomImageListAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, required: true, trim: true, default: 1},
      size: {int: true, required: true, trim: true, default: 30},
      classification: {int: true, default: 0}
    };
  }
};
