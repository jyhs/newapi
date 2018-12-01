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
        payInfo['cart_id'] = Number(cartId);
        payInfo['user_id'] = Number(userId);
        const nonceStr = payInfo.nonce_str[0];
        console.log(cartId);
        console.log(nonceStr);
        const cart = await this.model('cart').where({'id': cartId, 'nonceStr': nonceStr}).find();
        if (!think.isEmpty(cart)) {
          await this.model('pay').add(payInfo);
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
