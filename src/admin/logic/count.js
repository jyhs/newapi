module.exports = class extends think.Logic {
  grossSalesSummaryAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: {int: true, required: true, trim: true},
      from: {date: true, trim: true},
      to: {date: true, trim: true}
    };
  }
  groupSumByYearAction() {
    this.allowMethods = 'post';
    this.rules = {
      from: {date: true, required: true, trim: true},
      to: {date: true, required: true, trim: true},
      userId: {int: true, required: true, trim: true}
    };
  }
  groupCountByYearAction() {
    this.allowMethods = 'post';
    this.rules = {
      from: {date: true, required: true, trim: true},
      to: {date: true, required: true, trim: true},
      userId: {int: true, required: true, trim: true}
    };
  }
  groupUserListAction() {
    this.allowMethods = 'post';
    this.rules = {
      from: {date: true, required: true, trim: true},
      to: {date: true, required: true, trim: true},
      userId: {int: true, required: true, trim: true},
      limit: {int: true, trim: true}
    };
  }
  groupSupplierListAction() {
    this.allowMethods = 'post';
    this.rules = {
      from: {date: true, required: true, trim: true},
      to: {date: true, required: true, trim: true},
      userId: {int: true, required: true, trim: true},
      limit: {int: true, trim: true}
    };
  }
  groupMaterialListAction() {
    this.allowMethods = 'post';
    this.rules = {
      from: {date: true, required: true, trim: true},
      to: {date: true, required: true, trim: true},
      category: {string: true, trim: true},
      limit: {int: true, trim: true}
    };
  }
  async userCityListByProvinceAction() {
    this.allowMethods = 'post';
    this.rules = {
      province: {string: true, required: true, trim: true}
    };
  }
  async userListByProvinceAction() {
    this.allowMethods = 'post';
    this.rules = {
      limit: {int: true, trim: true}
    };
  }
};
