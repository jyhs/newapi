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
    const list = await model.where(where).order(['b.effort_date DESC', 'b.id DESC']).page(page, size).countSelect();
    _.each(list.data, (item) => {
      const efDate = moment(item['effort_date']);
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
    if (bill) {
      bill['effort_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(bill['effort_date']);
    }
    return this.json(bill);
  }
  async getCategoryListAction() {
    const billId = this.post('billId');
    const model = this.model('bill_detail').alias('d');
    model.field(['d.*']).join({
      table: 'material',
      join: 'inner',
      as: 'm',
      on: ['d.material_id', 'm.id']
    });
    const categoryList = await model.field('distinct m.category code').where({bill_id: billId}).select();
    const defineCategoryList = await this.controller('material', 'api').categoryAction();
    const result = _.intersectionBy(defineCategoryList, categoryList, 'code');
    const count = await this.model('bill_detail').where({bill_id: billId, material_id: 0}).count();
    if (count > 0) {
      result.push({'code': 'other', 'name': '未分类', 'desc': ''});
    }
    return this.json(result);
  }

  async getDetailByIdAction() {
    const id = this.post('detailId');
    const detail = await this.model('bill_detail').where({id: id}).find();
    return this.json(detail);
  }
  async getDetailByBillIdAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const id = this.post('billId');
    const model = this.model('bill_detail');
    const whereMap = {};
    whereMap['bill_id'] = id;
    if (!think.isEmpty(this.post('name'))) {
      whereMap['name'] = ['like', `%${this.post('name')}%`];
    }
    const list = await model.where(whereMap).page(page, size).countSelect();
    return this.json(list);
  }
  async getDetailByBillIdAndCategoryAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('bill_detail').alias('d');
    model.field(['d.*']).join({
      table: 'material',
      join: 'left',
      as: 'm',
      on: ['d.material_id', 'm.id']
    });
    const whereMap = {};
    whereMap['d.bill_id'] = this.post('billId');
    if (this.post('category') === 'other') {
      whereMap['d.material_id'] = 0;
    } else if (!think.isEmpty(this.post('name'))) {
      whereMap['d.name'] = ['like', `%${this.post('name')}%`];
    } else {
      whereMap['m.category'] = this.post('category');
    }
    const order = this.post('priceOrder');
    let list = null;
    if (think.isEmpty(order)) {
      list = await model.where(whereMap).page(page, size).countSelect();
    } else {
      list = await model.where(whereMap).order('price ' + order).page(page, size).countSelect();
    }
    this.json(list);
  }
  async getDetailByBillIdAndTypeAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('bill_detail').alias('d');
    model.field(['d.*']).join({
      table: 'material',
      join: 'inner',
      as: 'm',
      on: ['d.material_id', 'm.id']
    });
    const list = await model.where({'m.type': this.post('type'), 'd.bill_id': this.post('billId')}).page(page, size).countSelect();
    this.json(list);
  }
  async getDetailByBillIdAndRecommendAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('bill_detail');
    const list = await model.where({'recommend': this.post('recommend'), 'bill_id': this.post('billId')}).page(page, size).countSelect();
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
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('bill_detail');
    const list = await model.where({'recommend': ['!=', ''], 'bill_id': this.post('billId')}).page(page, size).countSelect();
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
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('bill_detail');
    const list = await model.where({'material_id': 0, 'bill_id': this.post('billId')}).page(page, size).countSelect();
    this.json(list);
  }
};
