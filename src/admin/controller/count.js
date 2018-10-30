const Base = require('./base.js');
// const _ = require('lodash');
module.exports = class extends Base {
  async grossSalesAction() {
    const userId = this.post('userId');
    const whereMap = {};
    if (!think.isEmpty(userId)) {
      whereMap['user_id'] = userId;
    }
    const sum = await this.model('cart').where(whereMap).sum('sum');
    this.json(sum);
  }
  async lastGrossSalesAction() {
    const userId = this.post('userId');
    const whereMap = {};
    whereMap['user_id'] = userId;
    whereMap['status'] = 0;
    const groupId = await this.model('group_bill').where(whereMap).max('id');
    const sum = await this.model('cart').where({group_bill_id: groupId}).sum('sum');
    this.json(sum);
  }
  async groupByYearAction() {
    const from = this.post('from') || this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('from'));
    const to = this.post('to') || this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('to'));
    const a = await this.model('group').countGroup(from, to);
    this.json(a);
  }
};
