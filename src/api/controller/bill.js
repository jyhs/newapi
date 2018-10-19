const Base = require('./base.js');
const _ = require('lodash');
const moment = require('moment');

module.exports = class extends Base {
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';

    const model = this.model('bill').alias('b');
    model.field(['b.*', 'u.name supplier_name']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['b.supplier_id', 'u.id']
    });
    const where = name ? {'b.name': ['like', `%${name}%`], 'b.is_one_step': 0} : {'b.is_one_step': 0};
    const list = await model.where(where).order(['b.effort_date DESC']).page(page, size).countSelect();
    _.each(list.data, (item) => {
      const efDate = moment(item['effort_date'], moment.ISO_8601);
      if (efDate.isAfter(moment())) {
        item['status'] = 1;
      } else {
        item['status'] = 0;
      }
      item['effort_date'] = efDate.format(this.config('date_format'));
    });
    return this.json(list);
  }
  async getAction() {
    const id = this.post('billId');
    const model = this.model('bill');
    const bill = await model.where({id: id}).find();
    return this.json(bill);
  }

  async getDetailByIdAction() {
    const id = this.post('detailId');
    const detail = await this.model('bill_detail').where({id: id}).find();
    return this.json(detail);
  }
  async getDetailByBillIdAction() {
    const id = this.post('billId');
    const model = this.model('bill_detail');
    const list = await model.where({bill_id: id}).select();
    return this.json(list);
  }
  async getDetailByBillIdAndCategoryAction() {
    const model = this.model('bill_detail').alias('d');
    model.field(['d.*']).join({
      table: 'material',
      join: 'inner',
      as: 'm',
      on: ['d.material_id', 'm.id']
    });
    const list = await model.where({'m.category': this.post('category'), 'd.bill_id': this.post('billId')}).select();
    this.json(list);
  }
  async getDetailByBillIdAndTypeAction() {
    const model = this.model('bill_detail').alias('d');
    model.field(['d.*']).join({
      table: 'material',
      join: 'inner',
      as: 'm',
      on: ['d.material_id', 'm.id']
    });
    const list = await model.where({'m.type': this.post('type'), 'd.bill_id': this.post('billId')}).select();
    this.json(list);
  }
  async getDetailByBillIdAndRecommendAction() {
    const model = this.model('bill_detail');
    const list = await model.where({'recommend': this.post('recommend'), 'bill_id': this.post('billId')}).select();
    _.each(list, (item) => {
      if (item.recommend === 'tj') {
        item.recommend = '推荐';
      }
      if (item.recommend === 'tej') {
        item.recommend = '特价';
      }
    });
    this.json(list);
  }
  async getDetailRecommendByBillIdAction() {
    const model = this.model('bill_detail');
    const list = await model.where({'recommend': ['!=', ''], 'bill_id': this.post('billId')}).select();
    _.each(list, (item) => {
      if (item.recommend === 'tj') {
        item.recommend = '推荐';
      }
      if (item.recommend === 'tej') {
        item.recommend = '特价';
      }
    });
    this.json(list);
  }
  async getDetailByBillIdAndUndefineAction() {
    const model = this.model('bill_detail');
    const list = await model.where({'material_id': ['=', null], 'bill_id': this.post('billId')}).select();
    this.json(list);
  }
};
