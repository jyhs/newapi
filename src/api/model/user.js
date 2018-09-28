const moment = require('moment');

module.exports = class extends think.Model {
  /**
   * 获取用户根据id
   * @returns {Promise.<*>}
   */
  async getUser(userId) {
    const user = await this.where({id: userId}).find();
    return user;
  }

  async getUserList({name, page, size, city, province, type}) {
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
    return list;
  }
};
