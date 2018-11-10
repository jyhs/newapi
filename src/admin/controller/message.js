const Base = require('./base.js');
const rp = require('request-promise');

module.exports = class extends Base {
  async getTokenAction() {
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      qs: {
        grant_type: 'client_credential',
        secret: think.config('weixin.public_secret'),
        appid: think.config('weixin.public_appid')
      }
    };

    let sessionData = await rp(options);
    sessionData = JSON.parse(sessionData);
    this.json(sessionData);
    return sessionData;
  }
  async sendMessageAction() {
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + this.getTokenAction()['access_token'],
      body: {
        touser: this.post('openId'),
        template_id: 'KuLyRiWNY-DTCKWdUzXQkkG5LOxTP-rNQ3Xjle-xDgg',
        url: 'https://group.huanjiaohu.com',
        topcolor: '#FF0000',
        data: {'first': {'value': '礁岩海水 CEO 开团了', 'color': '#173177'}, 'keyword1': {'value': 'york 姚远 开团了', 'color': '#173177'}, 'keyword2': {'value': '2018-11-08', 'color': '#173177'}, 'remark': {'value': 'tony 太牛逼了', 'color': '#173177'}}
      },
      json: true
    };

    const sessionData = await rp(options);
    // sessionData = JSON.parse(sessionData);
    this.json(sessionData);
  }
};
