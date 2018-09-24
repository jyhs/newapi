module.exports = class extends think.Model {
  /**
   * 获取团购金额根据groupid
   * @returns {Promise.<*>}
   */
  async getGroupMoneyById(id) {
    const sum = await this.model('cart').where({group_bill_id: id}).sum('sum');
    return sum || 0;
  }
};
