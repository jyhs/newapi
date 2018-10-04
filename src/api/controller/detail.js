const Base = require('./base.js');

module.exports = class extends Base {
  async getByIdAction() {
    const id = this.get('id');
    const model = this.model('bill_detail');
    const detail = await model.where({id: id}).find();
    return this.json(detail);
  }
  async getByBillIdAction() {
    const id = this.get('bill_id');
    const model = this.model('bill_detail');
    const list = await model.where({bill_id: id}).select();
    return this.json(list);
  }
  async getByBillIdAndCategoryAction() {
    const model = this.model('bill_detail').alias('d');
    model.field(['d.*']).join({
      table: 'material',
      join: 'inner',
      as: 'm',
      on: ['d.material_id', 'm.id']
    });
    const list = await model.where({'m.category': this.get('category'), 'd.bill_id': this.get('bill_id')}).select();
    this.json(list);
  }
  async getByBillIdAndTypeAction() {
    const model = this.model('bill_detail').alias('d');
    model.field(['d.*']).join({
      table: 'material',
      join: 'inner',
      as: 'm',
      on: ['d.material_id', 'm.id']
    });
    const list = await model.where({'m.type': this.get('type'), 'd.bill_id': this.get('bill_id')}).select();
    this.json(list);
  }
  async getByBillIdAndRecommendAction() {
    const model = this.model('bill_detail');
    const list = await model.where({'recommend': this.get('recommend'), 'bill_id': this.get('bill_id')}).select();
    this.json(list);
  }
  async getByBillIdAndUndefineAction() {
    const model = this.model('bill_detail');
    const list = await model.where({'material_id': ['=', null], 'bill_id': this.get('bill_id')}).select();
    this.json(list);
  }
};
