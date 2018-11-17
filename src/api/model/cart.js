module.exports = class extends think.Model {
  /**
   * 获取团购金额根据groupid
   * @returns {Promise.<*>}
   */
  async getGroupMoneyById(id) {
    const sumObj = await this.model('cart').field(['sum(sum+freight) sum']).where({group_bill_id: id}).find();
    return sumObj.sum || 0;
  }
};
