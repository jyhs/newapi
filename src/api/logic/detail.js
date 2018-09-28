module.exports = class extends think.Logic {
  getByIdAction() {
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  getByBillIdAction() {
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
};
