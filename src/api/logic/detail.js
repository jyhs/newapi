module.exports = class extends think.Logic {
  async getByIdAction() {
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  async getByBillIdAction() {
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
};
