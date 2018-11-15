const Base = require('./base.js');
const fs = require('fs');
const md5 = require('md5');
const images = require('images');
module.exports = class extends Base {
  async updateAction() {
    const userId = this.post('userId');

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
    if (think.isEmpty(this.post('city')) && !think.isEmpty(this.post('phone'))) {
      const cityObj = await this.controller('tools', 'api').getCityByPhoneAction(this.post('phone'));
      if (cityObj) {
        this.model('user').where({ 'id': userId }).update({city: cityObj.mark, province: cityObj.area, city_name: cityObj.city, province_name: cityObj.province});
      }
    }
    this.json('OK');
  }

  async typeAction() {
    const list = [
      {'code': 'yy', 'name': '鱼友', 'desc': '可以参加团购'},
      {'code': 'cjyy', 'name': '超级鱼友', 'desc': '可以参加团购'},
      {'code': 'cjtz', 'name': '超级团长', 'desc': '可以参加团购，一键开团'},
      {'code': 'fws', 'name': '服务商(本地)', 'desc': '可以参加团购、组织团购、上传普通出货单、一键开团'},
      {'code': 'lss', 'name': '零售商(全国)', 'desc': '可以参加团购、组织团购、上传普通出货单、一键开团'},
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
    const id = this.post('userId');
    const files = fs.readdirSync(this.config('image.user'));
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
    fs.renameSync(avatar.path, tempPath);
    await this.cache('getAvatarAction' + id, null);
    images(tempPath + '').size(150).save(this.config('image.user') + '/' + name, {
      quality: 75
    });
  }

  async getByTypeAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const province = this.post('province');
    const whereMap = {};
    whereMap['type'] = this.post('type');
    if (!think.isEmpty(province)) {
      whereMap['province'] = province;
    }
    const users = await this.model('user').where(whereMap).order(['id DESC']).page(page, size).countSelect();
    for (const item of users.data) {
      delete item.password;
    }
    this.json(users);
  }

  async getByIdAction() {
    const user = await this.model('user').where({id: this.post('userId')}).find();
    const focus = await this.model('focus').where({'user_id': user.id, material_id: ['!=', null]}).count();
    user.focusNo = focus || 0;
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
    const name = this.post('name');
    const city = this.post('city');
    const province = this.post('province');
    const type = this.post('type');
    const whereMap = {};
    if (!think.isEmpty(province)) {
      whereMap['u.province'] = province;
    }
    if (!think.isEmpty(type)) {
      whereMap['u.type'] = type;
    }
    if (!think.isEmpty(city)) {
      whereMap['u.city'] = city;
    }
    if (!think.isEmpty(name)) {
      whereMap['u.name'] = ['like', `%${name}%`];
    }
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
      .where(whereMap).order(['u.id DESC']).page(page, size).countSelect();
    for (const item of list.data) {
      const cartSummary = await this.model('cart').field(['count(id) count', 'IFNULL(sum(sum),0) sum']).where({'user_id': item.id}).find();
      item['sum'] = cartSummary.sum;
      item['count'] = cartSummary.sum ? cartSummary.count : cartSummary.sum;

      delete item.password;
    }
    this.json(list);
  }

  async updateUserCityAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 2;
    const list = await this.model('user').where({phone: ['!=', '18888888888']}).order(['id DESC']).page(page, size).countSelect();
    for (const user of list.data) {
      const cityObj = await this.controller('tools', 'api').getCityByPhoneAction(user.phone);
      if (cityObj) {
        this.model('user').where({ 'id': user.id }).update({city: cityObj.mark, province: cityObj.area, city_name: cityObj.city, province_name: cityObj.province});
      }
    }
    this.json({'status': 'OK'});
  }
};
