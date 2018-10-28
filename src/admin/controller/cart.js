const Base = require('./base.js');
const moment = require('moment');

module.exports = class extends Base {
  async lostAddAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId});
    const lostNum = cartDetail.cartDetail + 1;
    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'lost_num': lostNum});
    const billDetail = await this.model('bill_detail').where({id: billDetailId});
    const groupDetail = await this.model('cart').alias('c').field(['g.*']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    }).where({'c.id': cartId}).find();
    const tempFreight = billDetail.price * groupDetail.freight;
    let backFreight = null;
    if (Number(tempFreight.top_freight) === 0) {
      backFreight = tempFreight;
    } else {
      backFreight = tempFreight > groupDetail.top_freight ? groupDetail.top_freight : tempFreight;
    }
    let lostBack = billDetail.price + cartDetail.lost_back + backFreight;
    lostBack = lostBack > cartDetail.sum ? cartDetail.sum : lostBack;
    await this.model('cart').where({id: cartId}).update({'lost_back': lostBack});
  }
  async lostSubAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId});
    const lostNum = cartDetail.cartDetail - 1;
    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'lost_num': lostNum});
    const billDetail = await this.model('bill_detail').where({id: billDetailId});
    const groupDetail = await this.model('cart').alias('c').field(['g.*']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    }).where({'c.id': cartId}).find();
    const tempFreight = billDetail.price * groupDetail.freight;
    let backFreight = null;
    if (Number(tempFreight.top_freight) === 0) {
      backFreight = tempFreight;
    } else {
      backFreight = tempFreight > groupDetail.top_freight ? groupDetail.top_freight : tempFreight;
    }
    let lostBack = billDetail.price - cartDetail.lost_back - backFreight;
    lostBack = lostBack < 0 ? 0 : lostBack;
    await this.model('cart').where({id: cartId}).update({'lost_back': lostBack});
  }
  async damageAddAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId});
    const damageNum = cartDetail.cartDetail + 1;
    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'damage_num': damageNum});
    const billDetail = await this.model('bill_detail').where({id: billDetailId});
    let damageBack = billDetail.price + cartDetail.damage_back;
    damageBack = damageBack > cartDetail.sum ? cartDetail.sum : damageBack;
    await this.model('cart').where({id: cartId}).update({'damage_back': damageBack});
  }
  async damageSubAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId});
    const damageNum = cartDetail.cartDetail - 1;
    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'damage_num': damageNum});
    const billDetail = await this.model('bill_detail').where({id: billDetailId});
    let damageBack = billDetail.price - cartDetail.damage_back;
    damageBack = damageBack < 0 ? 0 : damageBack;
    await this.model('cart').where({id: cartId}).update({'damage_back': damageBack});
  }
  async deleteAction() {
    const cartId = this.post('cartId');
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      await this.model('cart_detail').where({cart_id: cartId}).delete();
      await this.model('cart').where({id: cartId}).delete();
      this.success(true);
    }
  }
  async deleteDetailAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      const group = await this.model('group_bill').where({id: cart.group_bill_id}).find();
      if (!moment(group.end_date).isAfter(moment())) {
        this.fail('团购已经结束不能操作购物车');
      } else if (group.status === 0) {
        this.fail('团购已经结束不能操作购物车');
      } else {
        await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).delete();
        this.success(true);
      }
    }
  }
  async getCurrentCartByGroupIdAction() {
    const userId = this.getLoginUserId();
    const groupBillId = this.post('groupId');
    const cart = await this.model('cart').where({'group_bill_id': groupBillId, 'user_id': userId}).find();
    this.json(cart);
  }
  async getByGroupIdAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const userId = this.getLoginUserId();
    const groupBillId = this.post('groupId');
    const cart = await this.model('cart').where({'group_bill_id': groupBillId, 'user_id': userId}).page(page, size).countSelect();
    this.json(cart);
  }
  async addAction() {
    const userId = this.getLoginUserId();
    const groupBillId = this.post('groupId');
    const cart = await this.model('cart').field('count(1) count').where({user_id: userId, group_bill_id: groupBillId}).find();
    if (cart.count !== 0) {
      this.fail('购物车已经存在');
    } else {
      const user = await this.model('user').where({id: userId}).find();
      const cartId = await this.model('cart').add({
        group_bill_id: groupBillId,
        user_id: userId,
        phone: user.phone,
        status: 1
      });
      const cart = await this.model('cart').where({id: cartId}).find();
      this.json(cart);
    }
  }
  async updateAction() {
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      const group = await this.model('group_bill').where({id: cart.group_bill_id}).find();
      if (!moment(group.end_date).isAfter(moment())) {
        this.fail('团购已经结束不能操作购物车');
      } else if (Number(group.status) === 0) {
        this.fail('团购已经结束不能操作购物车');
      } else {
        await this.model('cart').where({id: this.post('cartId')}).update({
          is_pay: this.post('isPay'),
          sum: this.post('sum'),
          description: this.post('description'),
          status: this.post('status'),
          freight: this.post('freight'),
          contacts: this.post('contacts'),
          address: this.post('address'),
          province: this.post('province'),
          city: this.post('city'),
          is_confirm: this.post('isConfirm')
        });
        this.success(true);
      }
    }
  }
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const userId = this.getLoginUserId();
    const model = this.model('cart').alias('c');
    model.field(['c.*', 'g.name group_name', 'g.status group_status']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    });
    const list = await model.where({'c.user_id': userId}).order(['c.id DESC']).page(page, size).countSelect();
    this.json(list);
  }
  async listByGroupIdAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const groupId = this.post('groupId');
    const model = this.model('cart').alias('c');
    model.field(['c.*', 'g.name group_name', 'g.status group_status']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    });
    const list = await model.where({'c.group_bill_id': groupId, 'c.is_confirm': 1}).order(['c.id DESC']).page(page, size).countSelect();
    this.json(list);
  }
  async updateDetailAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cart = await this.model('cart').where({id: cartId}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      const group = await this.model('group_bill').where({id: cart.group_bill_id}).find();
      if (!moment(group.end_date).isAfter(moment())) {
        this.fail('团购已经结束不能操作购物车');
      } else if (Number(group.status) === 0) {
        this.fail('团购已经结束不能操作购物车');
      } else {
        await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({
          bill_detail_num: billDetailNum
        });
      }
    }
  }
  async addOrUpdateDetailAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      const group = await this.model('group_bill').where({id: cart.group_bill_id}).find();
      if (!moment(group.end_date).isAfter(moment())) {
        this.fail('团购已经结束不能操作购物车');
      } else if (group.status === 0) {
        this.fail('团购已经结束不能操作购物车');
      } else {
        const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
        if (think.isEmpty(cartDetail)) {
          await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).add({
            cart_id: cartId,
            bill_detail_id: billDetailId,
            bill_detail_num: billDetailNum
          });
        } else {
          await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({
            bill_detail_num: billDetailNum
          });
        }
        await this.model('cart').where({id: cartId}).update({
          sum: this.post('sum'),
          freight: this.post('freight')
        });
      }
    }
  }
  async addDetailAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      const group = await this.model('group_bill').where({id: cart.group_bill_id}).find();
      if (!moment(group.end_date).isAfter(moment())) {
        this.fail('团购已经结束不能操作购物车');
      } else if (group.status === 0) {
        this.fail('团购已经结束不能操作购物车');
      } else {
        await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).add({
          cart_id: cartId,
          bill_detail_id: billDetailId,
          bill_detail_num: billDetailNum
        });
        await this.model('cart').where({id: cartId}).update({
          sum: this.post('sum'),
          freight: this.post('freight')
        });
      }
    }
  }
  async getAction() {
    const id = this.post('cartId');
    const cart = await this.model('cart').where({id: id}).find();
    return this.json(cart);
  }
  async listDetailAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const cartId = this.post('cartId');

    const model = this.model('cart_detail').alias('cd');
    model.field(['cd.*', 'b.size', 'b.price', 'b.point', 'b.material_id', 'b.numbers', 'b.limits', 'b.recommend', 'b.name']).join({
      table: 'cart',
      join: 'inner',
      as: 'c',
      on: ['cd.cart_id', 'c.id']
    }).join({
      table: 'bill_detail',
      join: 'inner',
      as: 'b',
      on: ['b.id', 'cd.bill_detail_id']
    });
    const list = await model.where({'cd.cart_id': cartId}).order(['cd.id DESC']).page(page, size).countSelect();
    return this.json(list);
  }
};
