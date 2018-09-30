const Base = require('./base.js');
const rp = require('request-promise');
const moment = require('moment');
const md5 = require('md5');
const _ = require('lodash');
const http = require('http');
const url = require('url');
const fs = require('fs');
const images = require('images');

module.exports = class extends Base {
  async bindPhoneAction() {
    await this.model('user').where({ id: this.getLoginUserId() }).update({
      phone: this.post('phone')
    });
    return this.success('操作成功');
  }
  async getByIdAction() {
    const user = await this.model('user').where({id: this.get('id')}).find();
    delete user.password;
    return this.json(user);
  }
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
      return this.json({
        'token': sessionKey,
        'province': user.province,
        'id': user.id,
        'username': user.name,
        'type': user.type
      });
    }
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
        await this.controller('user').login();
      }
    } else {
      await this.controller('user').login();
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
    await this.model('user').where({ id: this.getLoginUserId() }).update({
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
    const key = 'getAvatarAction' + this.getLoginUserId();
    const time = {timeout: 24 * 60 * 60 * 1000 * 7};
    const avatar = await this.cache(key);
    if (avatar) {
      this.type = 'image/jpeg';
      this.body = avatar;
    } else {
      const user = await this.model('user').field(['headimgurl']).where({ id: this.getLoginUserId() }).find();
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
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';
    const city = this.post('city') || '';
    const province = this.post('province') || '';
    const type = this.post('type') || '';
    const list = await this.model('user').getUserList({name, page, size, city, province, type});
    return this.json(list);
  }

  async registerAction() {
    const password1 = this.post('password1');
    const password2 = this.post('password2');
    const name = this.post('name');
    const city = this.post('city') || 'shc';
    const province = this.post('province') || 'sh';
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
        // 注册
        const user = {
          name: name,
          nickname: name,
          password: md5(password1),
          city: city,
          phone: phone,
          type: 'yy',
          province: province
        };
        user.id = await this.model('user').add(user);
        if (user.id > 0) {
          this.success('注册成功');
        } else {
          this.fail('注册失败');
        }
      }
    }
  }
  async typeListAction() {
    const list = [
      {'code': 'yy', 'name': '鱼友', 'desc': '可以参加团购'},
      {'code': 'cjyy', 'name': '超级鱼友', 'desc': '可以参加团购'},
      {'code': 'cjtz', 'name': '超级团长', 'desc': '可以参加团购，一键开团'},
      {'code': 'lss', 'name': '零售商(本地)', 'desc': '可以参加团购、组织团购、上传普通出货单、一键开团'},
      {'code': 'bdfws', 'name': '服务商(本地)', 'desc': '可以参加团购、组织团购、上传普通出货单、一键开团'},
      {'code': 'cjlss', 'name': '超级零售商(全国)', 'desc': '可以参加团购、组织团购、上传普通出货单、一键开团'},
      {'code': 'pfs', 'name': '批发商', 'desc': '可以参加团购、组织团购、上传普通出货单、上传私有出货单、一键开团'},
      {'code': 'qcs', 'name': '器材商', 'desc': '可以在商城发布商品'},
      {'code': 'yhgly', 'name': '用户管理员', 'desc': '可以管理用户列表'},
      {'code': 'jygly', 'name': '交易管理员', 'desc': '可以管理交易列表'},
      {'code': 'hdgly', 'name': '活动管理员', 'desc': '可以管理活动列表'},
      {'code': 'bkgly', 'name': '百科管理员', 'desc': '可以管理百科列表'},
      {'code': 'tggly', 'name': '团购管理员', 'desc': '可以管理团购列表'},
      {'code': 'admin', 'name': '超级管理员', 'desc': '可以管理团购列表'}
    ];
    return this.json(list);
  }

  async updateAction(userId) {
    const id = userId || this.getLoginUserId();
    const user = {
      city: this.post('city'),
      province: this.post('province'),
      phone: this.post('phone'),
      type: this.post('type'),
      code: this.post('code'),
      address: this.post('address'),
      description: this.post('description'),
      contacts: this.post('contacts'),
      status: this.post('status'),
      point: this.post('point') || 0
    };
    await this.model('user').where({id: id}).update(user);
    this.success('更新成功');
  }

  async uploadAvatarAction() {
    const avatar = think.extend({}, this.file('avatar'));
    const id = this.getLoginUserId();
    fs.readdir(think.config('image.user'), function(err, files) {
      if (err) {
        console.error(err);
      }
      if (files) {
        files.forEach((itm, index) => {
          const filedId = itm.split('.')[0];
          if (filedId === id) {
            fs.unlinkSync(think.config['image.user'] + itm);
          }
        });
      }
      const _name = avatar.filename;
      const tempName = _name.split('.');
      const name = id + '.' + tempName[1];
      const path = think.config['image.user'] + name;
      const tempPath = think.config['image.user'] + 'temp/' + name;

      const file = fs.createWriteStream(tempPath);
      file.on('error', (err) => {
        if (err) {
          this.fail('创建文件失败');
        }
      });

      file.on('end', (err) => {
        if (err) {
          this.fail('压缩文件失败');
        }
        this.cache.put('getAvatarAction' + id, null);
        images(tempPath).size(150).save(path, {
          quality: 75
        });
        this.success('上传头像成功');
      });
    });
  }
};
