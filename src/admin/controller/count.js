const Base = require('./base.js');
const _ = require('lodash');
module.exports = class extends Base {
  async grossSalesSummaryAction() {
    const userId = this.post('userId');
    const whereMap = {};
    if (!think.isEmpty(userId)) {
      whereMap['user_id'] = userId;
    }
    const sum = await this.model('cart').where(whereMap).sum('sum') || 0;
    whereMap['status'] = 0;
    const groupId = await this.model('group_bill').where(whereMap).max('id');
    const lastSum = await this.model('cart').where({group_bill_id: groupId}).sum('sum') || 0;
    this.json({
      sum: sum,
      lastSum: lastSum,
      week: 12,
      month: 10
    });
  }

  async groupByYearAction() {
    const from = this.post('from') || this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('from'));
    const to = this.post('to') || this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('to'));
    const userId = this.post('userId');
    const list = await this.model('group').countGroup(from, to, userId);
    const obj = {};
    _.each(list, (item) => {
      obj[item.date] = item.sum;
    });
    this.json(list);
  }
};
