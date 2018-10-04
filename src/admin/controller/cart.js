const Base = require('./base.js');
const moment = require('moment');

module.exports = class extends Base {
  async addAction() {
    const userId = this.getLoginUserId();
    const groupBillId = this.post('group_bill_id');
    const cart = await this.model('cart').field('count(1) count').where({user_id: userId, group_bill_id: groupBillId}).find();
    if (cart.count !== 0) {
      this.fail('购物车已经存在');
    } else {
      const user = await this.model('user').where({id: userId}).find();
      await this.model('cart').add({
        group_bill_id: groupBillId,
        user_id: userId,
        phone: user.phone,
        status: 1
      });
    }
  }
  async updateAction() {
    const cart = await this.model('cart').where({id: this.post('id')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      const group = await this.model('group_bill').where({id: cart.group_bill_id}).find();
      if (!moment(group.end_date + '', 'YYYYMMDDhmmss').isAfter(moment())) {
        this.fail('团购已经结束不能操作购物车');
      } else if (group.status === 0) {
        this.fail('团购已经结束不能操作购物车');
      } else {
        if (Number(cart.is_pay) === 1) {
          cart.is_pay = 2;
        }
        await this.model('cart').where({id: this.post('id')}).update({
          is_pay: cart.is_pay,
          sum: this.post('sum'),
          description: this.post('description'),
          status: this.post('status'),
          freight: this.post('freight'),
          contacts: this.post('contacts'),
          address: this.post('address'),
          province: this.post('province'),
          city: this.post('city'),
          is_confirm: this.post('is_confirm')
        });
      }
    }
  }
};
