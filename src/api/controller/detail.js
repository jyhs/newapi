const Base = require('../../common/controller/base.js');

module.exports = class extends Base {
  async getByIdAction() {
    const id = this.get('id');
    const model = this.model('bill_detail');
    const list = await model.where({id: id}).select();
    return this.json(list);
  }
  async getByBillIdAction() {
    const id = this.get('id');
    const model = this.model('bill_detail');
    const list = await model.where({bill_id: id}).select();
    return this.json(list);
  }
};
