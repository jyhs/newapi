const Base = require('./base.js');
const _ = require('lodash');
const http = require('http');
const url = require('url');
const fs = require('fs');
const md5 = require('md5');
// const images = require('images');
module.exports = class extends Base {
  async updateAction() {
    const userId = this.post('user_id');
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
    await this.model('user').where({id: userId}).update(user);
  }
  async getAvatarAction() {
    const userId = this.post('user_id');
    const key = 'getAvatarAction' + userId;
    const time = {timeout: 24 * 60 * 60 * 1000 * 7};
    const avatar = await this.cache(key);
    if (avatar) {
      this.type = 'image/jpeg';
      this.body = avatar;
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
          fs.readdir(this.config('image.user'), (err, files) => {
            let path = null;
            let _type = 'png';
            files.forEach((itm, index) => {
              const filedId = itm.split('.')[0];
              if (filedId === this.post('user_id')) {
                path = this.config('image.user') + itm;
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
              const decodeImg = Buffer.from(this.config['image.defaultUserAvatar'], 'base64');
              this.type = 'image/png';
              this.cache.put(key, resolve(this.body = decodeImg), time);
              resolve(resolve(this.body = decodeImg));
            }
          });
        });
      }
    }
  }
  async typeAction() {
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

  async uploadAvatarAction() {
    const avatar = this.file('avatar');
    const id = this.post('user_id');
    return new Promise((resolve, reject) => {
      fs.readdir(this.config('image.user'), (err, files) => {
        if (err) {
          reject(err);
        }
        if (!think.isEmpty(files)) {
          files.forEach((itm, index) => {
            const filedId = itm.split('.')[0];
            if (Number(filedId) === id) {
              fs.unlinkSync(this.config('image.user') + '/' + itm);
            }
          });
        }
        const _name = avatar.name;
        const tempName = _name.split('.');
        const name = id + '.' + tempName[1];
        const tempPath = this.config('image.user') + '/temp/' + name;

        fs.createWriteStream(tempPath);

        this.cache('getAvatarAction' + id, null);
        // images(tempPath).size(150).save(path, {
        //   quality: 75
        // });
        resolve('OK');
      });
    });
  }

  async getByTypeAction() {
    const users = await this.model('user').where({ type: this.post('type') }).select();
    const city = this.post('city');
    if (_.isEmpty(city)) {
      this.json(users);
    } else {
      this.json(_.filter(users, (user) => { return user.city === city }));
    }
  }

  async getByIdAction() {
    const user = await this.model('user').where({id: this.post('user_id')}).find();
    delete user.password;
    this.json(user);
  }

  async changPasswordAction() {
    await this.model('user').where({ id: this.getLoginUserId() }).update({
      password: md5(this.post('password'))
    });
  }

  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';
    const city = this.post('city') || '';
    const province = this.post('province') || '';
    const type = this.post('type') || '';
    const model = this.model('user').alias('u');
    const list = await model.field(['u.*', 'c.name city', 'p.name province'])
      .join({
        table: 'citys',
        join: 'inner',
        as: 'c',
        on: ['u.city', 'c.mark']
      })
      .join({
        table: 'provinces',
        join: 'inner',
        as: 'p',
        on: ['u.province', 'p.code']
      })
      .where({'u.name': ['like', `%${name}%`], 'u.city': ['like', `%${city}%`], 'u.province': ['like', `%${province}%`], 'u.type': ['like', `%${type}%`]}).order(['u.id DESC']).page(page, size).countSelect();
    for (const item of list.data) {
      delete item.password;
    }
    this.json(list);
  }
};
