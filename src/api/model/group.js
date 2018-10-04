const moment = require('moment');

module.exports = class extends think.Model {
  async getGroupList({name, page, size}) {
    const model = this.model('group_bill').alias('gb');
    const where = name ? {'gb.name': ['like', `%${name}%`]} : {'1': 1};
    const list = await model.field(['gb.*', 'c.name city', 'p.name province', 'u.name supplier_name'])
      .join({
        table: 'citys',
        join: 'inner',
        as: 'c',
        on: ['gb.city', 'c.mark']
      })
      .join({
        table: 'provinces',
        join: 'inner',
        as: 'p',
        on: ['gb.province', 'p.code']
      })
      .join({
        table: 'bill',
        join: 'inner',
        as: 'b',
        on: ['gb.bill_id', 'b.id']
      })
      .join({
        table: 'user',
        join: 'inner',
        as: 'u',
        on: ['b.supplier_id', 'u.id']
      }).where(where).order(['gb.id DESC', 'gb.end_date DESC']).page(page, size).countSelect();
    for (const item of list.data) {
      if (moment(item['end_date']).isAfter(moment())) {
        item['status'] = 1;
      } else {
        item['status'] = 0;
      }
      const sum = await this.model('cart').getGroupMoneyById(item['id']);
      item['sum'] = sum;
    }
    return list;
  }
  async getGroup(id) {
    const model = this.model('group_bill').alias('gb');
    const group = await model.field(['gb.*', 'c.name city', 'p.name province', 'u.name supplier_name'])
      .join({
        table: 'citys',
        join: 'inner',
        as: 'c',
        on: ['gb.city', 'c.mark']
      })
      .join({
        table: 'provinces',
        join: 'inner',
        as: 'p',
        on: ['gb.province', 'p.code']
      })
      .join({
        table: 'bill',
        join: 'inner',
        as: 'b',
        on: ['gb.bill_id', 'b.id']
      })
      .join({
        table: 'user',
        join: 'inner',
        as: 'u',
        on: ['b.supplier_id', 'u.id']
      }).where({'gb.id': id}).order(['gb.id DESC', 'gb.end_date DESC']).find();
    if (moment(group['end_date']).isAfter(moment())) {
      group['status'] = 1;
    } else {
      group['status'] = 0;
    }
    const sum = await this.model('cart').getGroupMoneyById(group['id']);
    group['sum'] = sum;
    return group;
  }
};
