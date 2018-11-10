const Base = require('./base.js');
const QcloudSms = require('qcloudsms_js');
const rp = require('request-promise');

module.exports = class extends Base {
  async sendVerificationAction() {
    const accessKeyId = think.config('weixin.accessKeyId');
    const secretAccessKey = think.config('weixin.mini_secretAccessKey');
    const qcloudsms = QcloudSms(accessKeyId, secretAccessKey);
    const code = parseInt(Math.random() * 9000 + 1000) + '';
    const ssender = qcloudsms.SmsSingleSender();
    const params = [code];
    return new Promise((resolve, reject) => {
      ssender.sendWithParam(86, this.post('phone'), 140767, params, '', '', '', (err, res, resData) => {
        if (err) {
          reject(this.fail('发送失败'));
        } else {
          this.cache(resData.sid, code, {
            timeout: 5 * 60 * 1000
          });
          resolve(this.json({'requestId': resData.sid}));
        }
      });
    });
  }
  async getCityByPhoneAction(phone) {
    const _phone = phone || this.post('phone');
    const options = {
      method: 'GET',
      url: 'http://apis.juhe.cn/mobile/get',
      qs: {
        phone: _phone,
        key: this.config('jhsj.phone_key')
      }
    };
    const phoneDate = await rp(options);
    let tempCity = null;
    if (phoneDate && JSON.parse(phoneDate).resultcode === '200') {
      tempCity = JSON.parse(phoneDate).result;
    } else {
      tempCity = {
        'province': '西藏',
        'city': '拉萨'
      };
    }
    const returnCity = await this.model('citys').where({'name': tempCity.city, 'type': 2}).find();
    if (!think.isEmpty(returnCity)) {
      tempCity.mark = returnCity.mark;
      tempCity.area = returnCity.area;
    }
    this.json(tempCity);
    return tempCity;
  }
  async getUserByTokenAction() {
    const token = this.post('token');
    const tokenSerivce = think.service('token');
    const user = await tokenSerivce.getUser(token);
    this.json(user);
  }
};
