module.exports = class extends think.Logic {
  async uploadAction() {
    this.allowMethods = 'post';
    this.rules = {
      bill_name: {string: true, trim: true, default: '礁岩海水团长单'},
      user_id: {int: true, required: true, trim: true},
      supplier_id: {int: true, required: true, trim: true},
      effort_date: {date: true, required: true},
      bill: {method: 'file', required: true}
    };
  }
  async listAction() {
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  async getByIdAction() {
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
};
