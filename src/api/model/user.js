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
  async clearBuyGoods(userId) {
    const $res = await this.model('user').where({id: userId, session_id: 1, checked: 1}).delete();
    return $res;
  }
};
