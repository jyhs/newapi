
module.exports = class extends think.Model {
  /**
   * 获取用户根据id
   * @returns {Promise.<*>}
   */
  async getUser(userId) {
    const user = await this.where({id: userId}).find();
    return user;
  }
};
