module.exports = class extends think.Logic {
  getCityByCodeAction() {
    this.rules = {
      code: {string: true, required: true, trim: true}
    };
  }
  getCityByProvinceAction() {
    this.rules = {
      province: {string: true, required: true, trim: true}
    };
  }
};
