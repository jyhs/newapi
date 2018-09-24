const md5 = require('md5');

module.exports = class extends think.Model {
  /**
   * 获取用户根据id
   * @returns {Promise.<*>}
   */
  async getUser(userId) {
    const user = await this.model('user').where({id: userId}).select();
    return user;
  }

  /**
   * 获取购物车的商品
   * @returns {Promise.<*>}
   */
  async getUserList(userId) {
    const goodsList = await this.model('user').where({id: userId}).select();
    return goodsList;
  }

  /**
   * 清空已购买的商品
   * @returns {Promise.<*>}
   */
  async login(self) {
    const name = self.post('name');
    const password = md5(self.post('password'));
    const user = await self.model('user').where({ name: name, password: password }).find();
    if (think.isEmpty(user)) {
      return self.fail('用户名密码不正确');
    } else if (user.status === 0) {
      return self.fail('该用户已经失效请联系管理员');
    } else {
      const TokenSerivce = self.service('token', 'api');
      const sessionKey = await TokenSerivce.create(user);
      if (think.isEmpty(sessionKey)) {
        return self.fail('登录失败');
      }
      return self.json({
        'token': sessionKey,
        'province': user.province,
        'id': user.id,
        'username': user.name,
        'type': user.type
      });
    }
  }
};
