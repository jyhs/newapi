module.exports = class extends think.Logic {
  getCityByCodeAction() {
    this.allowMethods = 'post';
    this.rules = {
      code: {string: true, required: true, trim: true}
    };
  }
  getCityByProvinceAction() {
    this.allowMethods = 'post';
    this.rules = {
      province: {string: true, required: true, trim: true}
    };
  }
  getCodeByCityAction() {
    this.allowMethods = 'post';
    this.rules = {
      city: {string: true, required: true, trim: true}
    };
  }
  getProvincesByCodeAction() {
    this.allowMethods = 'post';
    this.rules = {
      code: {string: true, required: true, trim: true}
    };
  }
};
