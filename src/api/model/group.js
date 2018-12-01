const moment = require('moment');

module.exports = class extends think.Model {
  async getGroupList({name, page, size, province, userId}) {
    const model = this.model('group_bill').alias('gb');
    const whereMap = {};
    if (!think.isEmpty(province)) {
      whereMap['gb.province'] = province;
    }
    if (!think.isEmpty(name)) {
      whereMap['gb.name'] = ['like', `%${name}%`];
    }
    if (!think.isEmpty(userId)) {
      whereMap['gb.user_id'] = userId;
    }
    const list = await model.field(['gb.*', '(select type from user where id=gb.user_id) user_type', 'date_format(gb.end_date, \'%Y-%m-%d %H:%i\') end_date_format', 'gb.bill_id billId', 'b.name bill_name', 'c.name city_name', 'p.name province_name', 'u.name supplier_name'])
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
      }).where(whereMap).order(['gb.status DESC', 'gb.id DESC', 'gb.end_date DESC']).page(page, size).countSelect();
    for (const item of list.data) {
      if (item['status'] !== 0) {
        if (moment(item['end_date']).isAfter(moment())) {
          item['status'] = 1;
        } else {
          item['status'] = 0;
          await this.model('group_bill').where({'id': item['id']}).update({'status': 0});
        }
      }
      const sumObj = await this.model('cart').field(['sum(sum) sum']).where({'group_bill_id': item['id'], 'is_confirm': 1}).find();
      item['sum'] = sumObj.sum || 0;
    }
    return list;
  }
  async getGroup(id) {
    const model = this.model('group_bill').alias('gb');
    const group = await model.field(['gb.*', 'c.name city', 'p.name province'])
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
      }).where({'gb.id': id}).order(['gb.id DESC', 'gb.end_date DESC']).find();

    if (group['status'] !== 0) {
      if (moment(group['end_date']).isAfter(moment())) {
        group['status'] = 1;
      } else {
        group['status'] = 0;
        await this.model('group_bill_id').where({'id': id}).update({'status': 0});
      }
    }

    const billModel = this.model('bill').alias('b');
    const supplierNameObj = await billModel.field(['u.name supplierName'])
      .join({
        table: 'group_bill',
        join: 'inner',
        as: 'g',
        on: ['g.bill_id', 'b.id']
      })
      .join({
        table: 'user',
        join: 'inner',
        as: 'u',
        on: ['b.supplier_id', 'u.id']
      }).where({'g.id': id}).find();
    group['supplierName'] = supplierNameObj ? supplierNameObj.supplierName : '';

    const sumObj = await this.model('cart').field(['sum(sum) sum']).where({'group_bill_id': id, 'is_confirm': 1}).find();
    group['sum'] = sumObj.sum || 0;
    return group;
  }
};
