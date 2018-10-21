const moment = require('moment');

module.exports = class extends think.Model {
  delete(id) {
    const deleteDetail = `delete from cart_detail where cart_id in (select id from (select c.id from cart c where c.group_bill_id=${id}) cartid)`;
    this.execute(deleteDetail);
  }
  summaryGroup(id) {
    const summaryGroup = `select bd.name,bd.size,bd.price,sum(bill_detail_num) bill_detail_num,sum((bd.price*cd.bill_detail_num)) sum,sum(c.freight) sum_freight,sum(c.lost_back) sum_lost_back,sum(c.damage_back) sum_damage_back from cart c,cart_detail cd,bill_detail bd where c.is_confirm=1 and c.id=cd.cart_id  and cd.bill_detail_id=bd.id and c.group_bill_id=${id} group by name,size,price`;
    return this.execute(summaryGroup);
  }
  detailGroup(id) {
    const detailGroup = `select IFNULL(u.nickname,u.name) userName,u.phone,u.contacts,(select name from citys where mark=u.province) province,(select name from citys where mark=u.city) city,if(u.address='null','',u.address) address,if(c.description='null','',c.description) description,bd.name,bd.size,bd.price,cd.bill_detail_num,(bd.price*cd.bill_detail_num) sum,c.freight,cd.lost_back_freight,cd.lost_num,cd.damage_num from cart c,cart_detail cd,bill_detail bd,user u where c.is_confirm=1 and c.id=cd.cart_id and c.user_id=u.id and cd.bill_detail_id=bd.id and c.group_bill_id=${id} order by c.id asc`;
    return this.execute(detailGroup);
  }
  async getUserGroupList({name, page, size, userId}) {
    const model = this.model('group_bill').alias('gb');
    const whereMap = {};
    if (!think.isEmpty(name)) {
      whereMap['gb.name'] = ['like', `%${name}%`];
    }
    if (!think.isEmpty(userId)) {
      whereMap['gb.user_id'] = userId;
    }
    const list = await model.field(['gb.*', 'gb.bill_id billId', 'b.name bill_name', 'c.name city_name', 'p.name province_name', 'u.name supplier_name'])
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
      }).where(whereMap).order(['gb.id DESC', 'gb.end_date DESC']).page(page, size).countSelect();
    for (const item of list.data) {
      if (item['status'] !== 0) {
        if (moment(item['end_date'], moment.ISO_8601).isAfter(moment())) {
          item['status'] = 1;
        } else {
          item['status'] = 0;
        }
      }
      const sum = await this.model('cart').where({group_bill_id: item['id']}).sum('sum');
      item['sum'] = sum || 0;
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

    if (group['status'] !== 0) {
      if (moment(group['end_date'], moment.ISO_8601).isAfter(moment())) {
        group['status'] = 1;
      } else {
        group['status'] = 0;
      }
    }
    const sum = await this.model('cart').getGroupMoneyById(group['id']);
    group['sum'] = sum;
    return group;
  }
};
