const Base = require('./base.js');
const fs = require('fs');
const _ = require('lodash');
module.exports = class extends Base {
  async addAction() {
    const notice = {
      user_id: this.getLoginUserId(),
      notice_id: this.post('noticeId')
    };
    await this.model('focus').add(notice);
  }

  async handleWxNotifyAction() {
    const payInfo = this.post('xml');
    try {
      if (payInfo) {
        const attach = payInfo.attach[0].split('-');
        const cartId = attach[1];
        const userId = attach[0];
        const nonceStr = payInfo.nonce_str[0];
        const cart = await this.model('cart').where({'id': cartId, 'nonceStr': nonceStr}).find();
        if (!think.isEmpty(cart)) {
          const payInfoObj = {
            cart_id: cartId,
            user_id: userId,
            appid: payInfo.appid[0],
            attach: payInfo.attach[0],
            bank_type: payInfo.bank_type[0],
            cash_fee: payInfo.cash_fee[0],
            fee_type: payInfo.fee_type[0],
            is_subscribe: payInfo.is_subscribe[0],
            mch_id: payInfo.mch_id[0],
            nonce_str: payInfo.nonce_str[0],
            openid: payInfo.openid[0],
            out_trade_no: payInfo.out_trade_no[0],
            result_code: payInfo.result_code[0],
            sign: payInfo.sign[0],
            time_end: payInfo.time_end[0],
            total_fee: payInfo.total_fee[0],
            trade_type: payInfo.trade_type[0],
            transaction_id: payInfo.transaction_id[0]
          };
          await this.model('pay').add(payInfoObj);
          cart['is_pay'] = 1;
          await this.model('cart').where({'id': cartId}).update(cart);
        }
        this.type = 'text/plain; charset=utf-8';
        this.body = '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
      }
    } catch (error) {

    }
  }

  async checkAction() {
    const notice = await this.model('focus').where({'user_id': this.getLoginUserId(), 'notice_id': this.post('noticeId')}).find();
    if (think.isEmpty(notice)) {
      this.json({'checked': true});
    } else {
      this.json({'checked': false});
    }
  }

  async getAction() {
    const dir = think.config('image.notice') + '/';
    const files = fs.readdirSync(dir);
    let maxId = 1;
    let defaultItem = '1.png';
    _.each(files, (itm) => {
      const filedId = itm.split('.')[0];
      if (Number(filedId) >= maxId) {
        maxId = Number(filedId);
        defaultItem = itm;
      }
    });
    this.json({'notice_file': 'https://static.huanjiaohu.com/image/notice/' + defaultItem, 'notice_id': maxId});
  }

  async publishAction() {
    const img = this.file('img');
    const dir = think.config('image.notice') + '/';
    const files = fs.readdirSync(dir);
    let maxId = 1;
    files.forEach((itm, index) => {
      const filedId = itm.split('.')[0];
      if (Number(filedId) >= maxId) {
        maxId = Number(filedId);
      }
    });
    const _name = img.name;
    const tempName = _name.split('.');
    const path = `${dir}${maxId + 1}.${tempName[1]}`;
    const file = fs.createWriteStream(path);
    file.on('error', (err) => {
      if (err) {
        this.fail('创建文件失败');
      }
    });
    await this.model('focus').where({'notice_id': ['!=', null]}).delete();
  }
};
