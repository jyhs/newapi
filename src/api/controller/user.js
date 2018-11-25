const Base = require('./base.js');
const rp = require('request-promise');
const moment = require('moment');
const md5 = require('md5');
const http = require('http');
const url = require('url');
const fs = require('fs');
const _ = require('lodash');
// const images = require('images');

module.exports = class extends Base {
  async login() {
    const name = this.post('name');
    const password = md5(this.post('password'));
    const user = await this.model('user').where({ name: name, password: password }).find();
    if (think.isEmpty(user)) {
      return this.fail('用户名密码不正确');
    } else if (user.status === 0) {
      return this.fail('该用户已经失效请联系管理员');
    } else {
      const TokenSerivce = this.service('token', 'api');
      const sessionKey = await TokenSerivce.create(user);
      if (think.isEmpty(sessionKey)) {
        return this.fail('登录失败');
      }
      user.token = sessionKey;
      return this.json(user);
    }
  }

  async logoutAction() {
    const user = this.getLoginUser();
    if (think.isEmpty(user)) {
      return this.fail('该用户不存在');
    } else {
      const TokenSerivce = this.service('token', 'api');
      const sessionKey = await TokenSerivce.create(user);
      if (think.isEmpty(sessionKey)) {
        return this.fail('登出失败');
      }
    }
  }

  async loginByPasswordAction() {
    if (this.post('isError')) {
      const auth = this.post('auth');
      const code = await this.cache(this.post('requestId'));
      if (think.isEmpty(code)) {
        this.fail('验证码失效');
      } else if (code !== auth) {
        this.fail('验证码不正确');
      } else {
        await this.controller('user').login();
      }
    } else {
      await this.controller('user').login();
    }
  }
  async loginByCodeAction() {
    const code = this.post('code');
    const from = this.post('from');
    const appid = from ? think.config('weixin.mini_appid') : think.config('weixin.public_appid');
    const secret = from ? think.config('weixin.mini_secret') : think.config('weixin.public_secret');
    // 获取unionid
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      qs: {
        grant_type: 'authorization_code',
        code: code,
        secret: appid,
        appid: secret
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
    user.token = sessionKey;
    return this.json(user);
  }

  async checkNameAction() {
    const count = await this.model('user').where({ name: this.post('name') }).count();
    if (count >= 1) {
      return this.fail('用户名已经存在');
    }
  }
  async checkPhoneAction() {
    const user = await this.model('user').field(['phone']).where({ id: this.getLoginUserId() }).find();
    if (!user.phone || user.phone === '18888888888') {
      this.json({'isBindPhone': false});
    } else {
      this.json({'isBindPhone': true});
    }
  }
  async forgetPasswordAction() {
    const auth = this.post('auth');
    const code = await this.cache(this.post('requestId'));
    if (think.isEmpty(code)) {
      this.fail('验证码失效');
    } else if (code !== auth) {
      this.fail('验证码不正确');
    } else {
      const user = await this.model('user').field(['phone']).where({ name: this.post('name') }).find();
      if (!user.phone || user.phone === '18888888888') {
        this.fail('未绑定手机');
      } else if (user.phone !== this.post('phone')) {
        this.fail('手机号和注册手机号不一致');
      } else {
        this.json(user);
      }
    }
  }

  async registerAction() {
    const password1 = this.post('password1');
    const password2 = this.post('password2');
    const name = this.post('name');
    const phone = this.post('phone');
    const auth = this.post('auth');
    const requestId = this.post('requestId');
    const code = await this.cache(requestId);
    if (think.isEmpty(code)) {
      this.fail('验证码失效');
    } else if (code !== auth) {
      this.fail('验证码不正确');
    } else if (password1 !== password2) {
      this.fail('两次输入的密码不匹配');
    } else {
      const user = await this.model('user').where({name: name}).find();
      if (!think.isEmpty(user)) {
        this.fail('用户名已经存在');
      } else {
        const user = {
          name: name,
          nickname: name,
          password: md5(password1),
          phone: phone,
          type: 'yy'
        };
        user.id = await this.model('user').add(user);
        if (user.id > 0) {
          const cityObj = await this.controller('tools').getCityByPhoneAction(phone);
          if (cityObj) {
            this.model('user').where({ 'id': user.id }).update({city: cityObj.mark, province: cityObj.area, city_name: cityObj.city, province_name: cityObj.province});
          }
          this.success('注册成功');
        } else {
          this.fail('注册失败');
        }
      }
    }
  }

  async getAvatarAction() {
    const userId = this.get('userId');
    const key = 'getAvatarAction' + userId;
    const avatar = await this.cache(key);
    if (avatar) {
      this.type = 'image/jpeg';
      this.body = Buffer.from(avatar, 'base64');
    } else {
      const user = await this.model('user').field(['headimgurl']).where({ id: userId }).find();
      if (!_.isEmpty(user.headimgurl)) {
        return new Promise((resolve, reject) => {
          const urlObject = url.parse(user.headimgurl);
          const options = {
            hostname: urlObject.host,
            port: urlObject.port,
            path: urlObject.path,
            method: 'GET'
          };
          const req = http.request(options, (resUrl) => {
            resUrl.on('data', (chunk) => {
              const decodeImg = Buffer.from(chunk.toString('base64'), 'base64');
              this.cache(key, resolve(this.body = decodeImg));
              this.type = 'image/jpeg';
              resolve(this.body = decodeImg);
            });
          });
          req.on('error', (e) => {
            reject(e);
          });
          req.end();
        });
      } else {
        const readDir = fs.readdirSync(this.config('image.user'));
        let path = null;
        let _type = 'png';
        _.each(readDir, (itm) => {
          const filedId = itm.split('.')[0];
          if (Number(filedId) === Number(userId)) {
            path = this.config('image.user') + '/' + itm;
            _type = itm.split('.')[1];
          }
        });
        if (path) {
          const image = fs.readFileSync(path);
          const decodeImg = Buffer.from(image.toString('base64'), 'base64');
          this.type = 'image/' + _type;
          this.cache(key, decodeImg);
          this.body = decodeImg;
        } else {
          const decodeImg = Buffer.from(this.config('image.defaultUserAvatar'), 'base64');
          this.type = 'image/png';
          this.cache(key, decodeImg);
          this.body = decodeImg;
        };
      }
    }
  }
};
