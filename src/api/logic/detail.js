module.exports = class extends think.Logic {
  getByIdAction() {
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  getByBillIdAction() {
    this.rules = {
      bill_id: {int: true, required: true, trim: true}
    };
  }
  getByBillIdAndCategoryAction() {
    this.rules = {
      bill_id: {int: true, required: true, trim: true},
      category: {string: true, required: true, trim: true}
    };
  }
  getByBillIdAndRecommendAction() {
    this.rules = {
      bill_id: {int: true, required: true, trim: true},
      recommend: {string: true, required: true, trim: true}
    };
  }
  getByBillIdAndTypeAction() {
    this.rules = {
      bill_id: {int: true, required: true, trim: true},
      type: {string: true, required: true, trim: true}
    };
  }
  getByBillIdAndUndefineAction() {
    this.rules = {
      bill_id: {int: true, required: true, trim: true}
    };
  }
};
