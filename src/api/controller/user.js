const Base = require('../../common/controller/base.js');
const rp = require('request-promise');
const moment = require('moment');
const md5 = require('md5');
const _ = require('lodash');
const http = require('http');
const url = require('url');
const fs = require('fs');
module.exports = class extends Base {
  async bindPhoneAction() {
    await this.model('user').where({ id: this.post('id') }).update({
      phone: this.post('phone')
    });
    return this.success('操作成功');
  }
  async getByIdAction() {
    const user = await this.model('user').where({id: this.get('id')}).find();
    delete user.password;
    return this.json(user);
  }
  async loginByPasswordAction() {
    if (this.post('is_error')) {
      const auth = this.post('auth');
      const code = await this.cache(this.post('requestId'));
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
  async changPasswordAction() {
    await this.model('user').where({ id: this.post('id') }).update({
      password: md5(this.post('password'))
    });
    return this.success('操作成功');
  }
  async checkNamedAction() {
    const count = await this.model('user').where({ name: this.get('name') }).count();
    if (count >= 1) {
      return this.fail('用户名已经存在');
    } else {
      return this.success('用户名不存在');
    }
  }
  async checkPhoneAction() {
    const user = await this.model('user').field(['phone']).where({ id: this.get('id') }).find();
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
      const user = await this.model('user').field(['phone', 'id']).where({ name: this.post('name') }).find();
      if (!user.phone || user.phone === '18888888888') {
        this.fail('未绑定手机');
      } else if (user.phone !== this.post('phone')) {
        this.fail('手机号和注册手机号不一致');
      } else {
        this.json(user);
      }
    }
  }
  async getByTypeAction() {
    const users = await this.model('user').where({ type: this.get('type') }).select();
    const city = this.get('city');
    if (_.isEmpty(city)) {
      this.json(users);
    } else {
      this.json(_.filter(users, (user) => { return user.city === city }));
    }
  }
  async getAvatarAction() {
    const key = 'getAvatarAction' + this.get('id');
    const time = {timeout: 24 * 60 * 60 * 1000 * 7};
    const avatar = await this.cache(key);
    if (avatar) {
      this.type = 'image/jpeg';
      this.body = avatar;
    } else {
      const user = await this.model('user').field(['headimgurl']).where({ id: this.get('id') }).find();
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
              this.cache(key, resolve(this.body = decodeImg), time);
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
        return new Promise((resolve, reject) => {
          fs.readdir(think.config['image.user'], (err, files) => {
            let path = null;
            let _type = 'png';
            files.forEach((itm, index) => {
              const filedId = itm.split('.')[0];
              if (filedId === this.get('id')) {
                path = think.config['image.user'] + itm;
                _type = itm.split('.')[1];
              } else {
                reject(err);
              }
            });
            if (path) {
              fs.readFile(path, (err, data) => {
                if (err) {
                  reject(err);
                } else {
                  const decodeImg = Buffer.from(data.toString('base64'), 'base64');
                  this.type = 'image/' + _type;
                  this.cache.put(key, resolve(this.body = decodeImg), time);
                  resolve(resolve(this.body = decodeImg));
                }
              });
            } else {
              const decodeImg = Buffer.from(think.config['image.defaultUserAvatar'], 'base64');
              this.type = 'image/png';
              this.cache.put(key, resolve(this.body = decodeImg), time);
              resolve(resolve(this.body = decodeImg));
            }
          });
        });
      }
    }
  }
};
