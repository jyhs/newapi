const Base = require('../../common/controller/base.js');
const rp = require('request-promise');
const moment = require('moment');

module.exports = class extends Base {
  async getByIdAction() {
    const user = await this.model('user').where({id: this.get('id')}).find();
    delete user.password;
    return this.json(user);
  }
  async loginByPasswordAction() {
    if (this.post('is_error')) {
      const auth = this.post('auth');
      const code = await this.cache(this.post('requestId') ? this.post('requestId') : '0');
      if (think.isEmpty(code)) {
        this.fail('验证码失效');
      } else if (code !== auth) {
        this.fail('验证码不正确');
      } else {
        await this.model('user').login(this);
      }
    } else {
      await this.model('user').login(this);
    }
  }
  async loginByCodeAction() {
    const code = this.get('code');
    // 获取unionid
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      qs: {
        grant_type: 'authorization_code',
        code: code,
        secret: think.config('weixin.secret'),
        appid: think.config('weixin.appid')
      }
    };

    let sessionData = await rp(options);
    sessionData = JSON.parse(sessionData);
    if (!sessionData.unionid) {
      return this.fail('登录失败');
    }
    // 根据unionid查找用户是否已经注册
    let user = await this.model('user').where({ unionid: sessionData.unionid }).find();
    if (think.isEmpty(user)) {
      let city = await this.model('citys').where({ name: sessionData.city }).find('mark', true);
      let province = await this.model('provinces').where({ name: sessionData.province }).find('code', true);
      if (think.isEmpty(province)) {
        province = 'sh';
        city = 'shc';
      } else if (province === 'sh') {
        city = 'shc';
      } else if (province === 'bj') {
        city = 'bjc';
      }
      // 注册
      user = {
        name: sessionData.nickName,
        nickname: sessionData.nickName,
        password: '0ff8ecf84a686258caeb350dbc8040d6',
        city: city,
        phone: '18888888888',
        type: 'yy',
        province: province,
        country: sessionData.country,
        openid: sessionData.openid,
        headimgurl: sessionData.headimgurl || '',
        sex: sessionData.sex || 1, // 性别 0：未知、1：男、2：女
        province_name: sessionData.province,
        city_name: sessionData.city,
        unionid: sessionData.unionid
      };
      user.id = await this.model('user').add(user);
    }

    // 更新登录信息
    await this.model('user').where({ id: user.id }).update({
      insert_date: moment().format('YYYYMMDD'),
      headimgurl: sessionData.headimgurl
    });
    // 获得token
    const TokenSerivce = this.service('token', 'api');
    const sessionKey = await TokenSerivce.create(user);

    if (think.isEmpty(sessionKey)) {
      return this.fail('登录失败');
    }
    return this.json({
      'token': sessionKey,
      'province': user.province,
      'id': user.id,
      'username': user.name,
      'type': user.type
    });
  }
};
