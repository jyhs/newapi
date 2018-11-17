const Base = require('./base.js');
const moment = require('moment');
const _ = require('lodash');

module.exports = class extends Base {
  async lostAddAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const sum = this.post('sum');
    const freight = this.post('freight');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    const lostNum = cartDetail.lost_num - 1;
    const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
    const groupDetail = await this.model('cart').alias('c').field(['g.*', 'c.*']).join({
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
    let lostBack = groupDetail.lost_back - billDetail.price - backFreight;
    lostBack = lostBack > groupDetail.sum ? groupDetail.sum : lostBack;

    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'lost_num': lostNum, 'bill_detail_num': billDetailNum, 'lost_back_freight': cartDetail.lost_back_freight - billDetail.price - backFreight});
    await this.model('cart').where({id: cartId}).update({'lost_back': lostBack, 'sum': sum, 'freight': freight});
    this.success(true);
  }
  async lostSubAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const sum = this.post('sum');
    const freight = this.post('freight');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    const lostNum = cartDetail.lost_num + 1;

    const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
    const groupDetail = await this.model('cart').alias('c').field(['g.*', 'c.*']).join({
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
    let lostBack = billDetail.price + groupDetail.lost_back + backFreight;
    lostBack = lostBack < 0 ? 0 : lostBack;

    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'lost_num': lostNum, 'bill_detail_num': billDetailNum, 'lost_back_freight': cartDetail.lost_back_freight + billDetail.price + backFreight});
    await this.model('cart').where({id: cartId}).update({'lost_back': lostBack, 'sum': sum, 'freight': freight});
    this.success(true);
  }
  async damageAddAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const sum = this.post('sum');
    const freight = this.post('freight');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    const damageNum = cartDetail.damage_num - 1;
    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'damage_num': damageNum, 'bill_detail_num': billDetailNum});
    const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
    const cart = await this.model('cart').where({id: cartId}).find();
    let damageBack = cart.damage_back - billDetail.price;
    damageBack = damageBack > cart.sum ? cart.sum : damageBack;

    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'damage_num': damageNum, 'bill_detail_num': billDetailNum, 'damage_back_freight': 0});
    await this.model('cart').where({id: cartId}).update({'damage_back': damageBack, 'sum': sum, 'freight': freight});
    this.success(true);
  }
  async damageSubAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const sum = this.post('sum');
    const freight = this.post('freight');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    const damageNum = cartDetail.damage_num + 1;

    const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
    const cart = await this.model('cart').where({id: cartId}).find();
    let damageBack = billDetail.price + cart.damage_back;
    damageBack = damageBack < 0 ? 0 : damageBack;

    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'damage_num': damageNum, 'bill_detail_num': billDetailNum, 'damage_back_freight': 0});
    await this.model('cart').where({id: cartId}).update({'damage_back': damageBack, 'sum': sum, 'freight': freight});
    this.success(true);
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
      } else if (Number(group.status) === 0) {
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
  async updatePayAction() {
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      if (Number(cart['isConfirm']) === 0) {
        this.fail('鱼友未确认购物车');
      } else {
        await this.model('cart').where({id: this.post('cartId')}).update({
          is_pay: this.post('isPay')
        });
        this.success(true);
      }
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
        if (Number(this.post('sum')) === 0 && Number(this.post('isConfirm')) === 1) {
          this.fail('确认时购物车不能为空');
        } else {
          const updateCart = {
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
          };
          await this.model('cart').where({id: this.post('cartId')}).update(updateCart);
          // const user = this.getLoginUser();
          // if (user.id !== group.user_id && Number(updateCart.is_confirm) === 1) {
          //   const wexinService = this.service('weixin', 'api');
          //   const grouper = this.model('user').where({id: group.user_id}).find();
          //   wexinService.sendOrderMessage(grouper, user, group);
          // }
          this.success(true);
        }
      }
    }
  }
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const userId = this.post('userId') ? this.post('userId') : this.getLoginUserId();
    const model = this.model('cart').alias('c');
    model.field(['c.*', 'u.type user_type', 'date_format(c.insert_date, \'%Y-%m-%d %H:%i\') insert_date_format', 'g.name group_name', 'g.status group_status', 'g.contacts group_user_name', 'g.user_id group_user_id'])
      .join({
        table: 'group_bill',
        join: 'inner',
        as: 'g',
        on: ['c.group_bill_id', 'g.id']
      })
      .join({
        table: 'user',
        join: 'inner',
        as: 'u',
        on: ['g.user_id', 'u.id']
      });
    const list = await model.where({'c.user_id': userId, 'is_confirm': 1}).order(['c.id DESC']).page(page, size).countSelect();
    _.each(list.data, (item) => {
      item['total'] = Number(item['sum']) + Number(item['freight']);
      if (item['user_type'] === 'lss' || item['user_type'] === 'lss') {
        item['is_group'] = false;
      } else {
        item['is_group'] = true;
      }
    });
    this.json(list);
  }

  async listByGroupIdAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const groupId = this.post('groupId');
    const model = this.model('cart').alias('c');
    model.field(['c.*', 'g.name group_name', 'g.status group_status', 'u.name user_name', 'u.type user_type']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    }).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['c.user_id', 'u.id']
    });
    const list = await model.where({'c.group_bill_id': groupId, 'c.is_confirm': 1}).order(['c.id DESC']).page(page, size).countSelect();
    _.each(list.data, (item) => {
      item['total'] = Number(item['sum']) + Number(item['freight']);
      if (item['user_type'] === 'lss' || item['user_type'] === 'lss') {
        item['is_group'] = false;
      } else {
        item['is_group'] = true;
      }
    });
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
      } else if (Number(group.status) === 0) {
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
      } else if (Number(group.status) === 0) {
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
