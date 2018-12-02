const Base = require('./base.js');
const moment = require('moment');
const _ = require('lodash');

module.exports = class extends Base {
  async lostAddAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    const lostNum = cartDetail.lost_num - 1;
    const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
    const groupDetail = await this.model('cart').alias('c').field(['g.*', 'c.lost_back']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    }).where({'c.id': cartId}).find();
    const tempFreight = billDetail.price * groupDetail.freight;
    let backFreight = null;
    if (Number(groupDetail.top_freight) === 0) {
      backFreight = tempFreight;
    } else {
      backFreight = tempFreight > groupDetail.top_freight ? groupDetail.top_freight : tempFreight;
    }
    let lostBack = groupDetail.lost_back - billDetail.price - backFreight;
    lostBack = lostBack > groupDetail.sum ? groupDetail.sum : lostBack;
    const lostBackFreight = cartDetail.lost_back_freight - backFreight;

    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'lost_num': lostNum, 'bill_detail_num': billDetailNum, 'lost_back_freight': lostBackFreight});
    await this.model('cart').where({id: cartId}).update({'lost_back': lostBack});
    this.success(true);
  }
  async lostSubAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    const lostNum = cartDetail.lost_num + 1;
    const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
    const groupDetail = await this.model('cart').alias('c').field(['g.*', 'c.lost_back']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    }).where({'c.id': cartId}).find();
    const tempFreight = billDetail.price * groupDetail.freight;
    let backFreight = null;
    if (Number(groupDetail.top_freight) === 0) {
      backFreight = tempFreight;
    } else {
      backFreight = tempFreight > groupDetail.top_freight ? groupDetail.top_freight : tempFreight;
    }

    let lostBack = billDetail.price + groupDetail.lost_back + backFreight;
    lostBack = lostBack < 0 ? 0 : lostBack;
    const lostBackFreight = cartDetail.lost_back_freight + backFreight;

    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'lost_num': lostNum, 'bill_detail_num': billDetailNum, 'lost_back_freight': lostBackFreight});
    await this.model('cart').where({id: cartId}).update({'lost_back': lostBack});
    this.success(true);
  }
  async damageAddAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    const damageNum = cartDetail.damage_num - 1;
    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'damage_num': damageNum, 'bill_detail_num': billDetailNum});
    const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
    const cart = await this.model('cart').where({id: cartId}).find();
    const damageBack = cart.damage_back - billDetail.price;
    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'damage_num': damageNum, 'bill_detail_num': billDetailNum, 'damage_back_freight': 0});
    await this.model('cart').where({id: cartId}).update({'damage_back': damageBack});
    this.success(true);
  }
  async damageSubAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    const damageNum = cartDetail.damage_num + 1;
    const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
    const cart = await this.model('cart').where({id: cartId}).find();
    let damageBack = billDetail.price + cart.damage_back;
    damageBack = damageBack < 0 ? 0 : damageBack;

    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'damage_num': damageNum, 'bill_detail_num': billDetailNum, 'damage_back_freight': 0});
    await this.model('cart').where({id: cartId}).update({'damage_back': damageBack});
    this.success(true);
  }
  async deleteAction(_cartId) {
    const cartId = _cartId || this.post('cartId');
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
        await this.model('cart').where({id: cartId}).update({
          sum: this.post('sum'),
          freight: this.post('freight')
        });
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
    const phone = this.post('phone');
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else if (phone && phone === '18888888888') {
      this.fail('请输入正确的手机号');
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
          const cityObj = await this.controller('tools', 'api').getCityByPhoneAction(phone);
          if (cityObj) {
            const userId = this.getLoginUserId();
            this.model('user').where({ 'id': userId }).update({city: cityObj.mark, province: cityObj.area, city_name: cityObj.city, province_name: cityObj.province});
          }
          this.success(true);
        }
      }
    }
  }
  async listAction(_userId) {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const userId = _userId || (this.post('userId') ? this.post('userId') : this.getLoginUserId());
    const model = this.model('cart').alias('c');
    model.field(['c.*', 'u.type group_user_type', 'date_format(c.insert_date, \'%Y-%m-%d %H:%i\') insert_date_format', 'g.name group_name', 'g.status group_status', 'g.contacts group_user_name', 'g.user_id group_user_id'])
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
    const list = await model.where({'c.user_id': userId, 'is_confirm': 1, 'sum': ['!=', 0]}).order(['c.id DESC']).page(page, size).countSelect();
    _.each(list.data, (item) => {
      item['total'] = Number(item['sum']) + Number(item['freight']) - Number(item['lost_back']) - Number(item['damage_back']);
      if (item['group_user_type'] === 'lss') {
        item['is_group'] = false;
      } else {
        item['is_group'] = true;
      }
    });
    this.json(list);
    return list;
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
    const list = await model.where({'c.group_bill_id': groupId, 'c.is_confirm': 1, 'c.sum': ['!=', 0]}).order(['c.id DESC']).page(page, size).countSelect();
    _.each(list.data, (item) => {
      item['total'] = Number(item['sum']) + Number(item['freight']) - Number(item['lost_back']) - Number(item['damage_back']);
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
        const model = this.model('cart_detail').alias('c');
        model.field(['c.*', 'b.price']).join({
          table: 'bill_detail',
          join: 'inner',
          as: 'b',
          on: ['c.bill_detail_id', 'b.id']
        });
        const cartDetail = await model.where({'c.bill_detail_id': billDetailId, 'c.cart_id': cartId}).find();
        let freight = Number(cartDetail.price) * billDetailNum * Number(group.freight);
        if (Number(group.top_freight) !== 0) {
          freight = freight > group.top_freight ? group.top_freight : freight;
        }
        await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({
          bill_detail_num: billDetailNum,
          freight: freight
        });
        await this.model('cart').where({id: cartId}).update({
          sum: this.post('sum'),
          freight: this.post('freight')
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
        const model = this.model('cart_detail').alias('c');
        model.field(['c.*', 'b.price']).join({
          table: 'bill_detail',
          join: 'inner',
          as: 'b',
          on: ['c.bill_detail_id', 'b.id']
        });
        const cartDetail = await model.where({'c.bill_detail_id': billDetailId, 'c.cart_id': cartId}).find();
        let freight = Number(cartDetail.price) * billDetailNum * Number(group.freight);
        if (Number(group.top_freight) !== 0) {
          freight = freight > group.top_freight ? group.top_freight : freight;
        }
        if (think.isEmpty(cartDetail)) {
          await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).add({
            cart_id: cartId,
            bill_detail_id: billDetailId,
            bill_detail_num: billDetailNum,
            freight: freight
          });
        } else {
          await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({
            bill_detail_num: billDetailNum,
            freight: freight
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
  async createOrderAction() {
    // const user = this.getLoginUser();
    // if (think.isEmpty(user.openid)) {
    //   this.fail('请使用微信账号登录');
    // } else {
    const cartId = this.post('cartId');
    const cart = await this.model('cart').where({id: cartId}).find();
    const wexinService = this.service('weixin', 'api');
    const payInfo = {};
    payInfo.orderNo = `Coral-${cart.group_bill_id}-${cartId}` + Math.floor(Math.random() * 10 + 1);
    // payInfo.totalFee = Number(cart.sum) + Number(cart.freight) - Number(cart.lost_back) - Number(cart.damage_back);
    payInfo.totalFee = 1;
    payInfo.openid = 'ohGtg1o1F-fgzmbXElW1fbFNvdDg';
    payInfo.ip = '111.231.136.250';
    payInfo.body = '礁岩海水支付';
    payInfo.cartId = cartId;
    // payInfo.userId = user.id;
    payInfo.userId = 5157;
    const payRequest = await wexinService.createUnifiedOrder(payInfo);
    if (payRequest.error) {
      this.fail(payRequest.error);
    } else {
      await this.model('cart').where({id: cartId}).update({ 'nonceStr': payRequest.nonceStr });
      console.log(payRequest);
      // { appId: 'wx6edb9c7695fb8375',
      // 0|jyhs  |   timeStamp: '1543716865',
      // 0|jyhs  |   nonceStr: '8bzfjte12k3',
      // 0|jyhs  |   package: 'prepay_id=wx02101425667089d5ea6d5b8f0036848458',
      // 0|jyhs  |   signType: 'MD5',
      // 0|jyhs  |   paySign: '92eaf9529af1168bd1909297c66b110f' }
      this.json(payRequest);
    }
    // }
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
