const Base = require('./base.js');
const _ = require('lodash');
module.exports = class extends Base {
  async grossSalesSummaryAction() {
    let userId = this.post('userId');
    const user = this.getLoginUser();
    const whereMap = {};
    if (user.type !== 'admin' || user.type !== 'tggly') {
      whereMap['user_id'] = userId;
    } else {
      userId = null;
    }
    const sum = await this.model('cart').where(whereMap).sum('sum') || 0;
    whereMap['status'] = 0;
    const groupId = await this.model('group_bill').where(whereMap).max('id');
    const lastSum = await this.model('cart').where({group_bill_id: groupId}).sum('sum') || 0;
    const sumThisWeekGroup = await this.model('group').sumThisWeekGroup(userId);
    const sumLastWeekGroup = await this.model('group').sumLastWeekGroup(userId);
    const sumThisMonthGroup = await this.model('group').sumThisMonthGroup(userId);
    const sumLastMonthGroup = await this.model('group').sumLastMonthGroup(userId);
    this.json({
      sum: sum,
      lastSum: lastSum,
      week: Math.round(Math.abs(sumThisWeekGroup[0].sum - sumLastWeekGroup[0].sum) / (sumLastWeekGroup[0].sum + 1)) * 100,
      weekUp: sumThisWeekGroup[0].sum - sumLastWeekGroup[0].sum >= 0,
      month: Math.round(Math.abs(sumThisMonthGroup[0].sum - sumLastMonthGroup[0].sum) / (sumLastMonthGroup[0].sum + 1)) * 100,
      monthUp: sumLastMonthGroup[0].sum - sumThisMonthGroup[0].sum >= 0
    });
  }
  async groupSumByYearAction() {
    const from = this.service('date', 'api').convertWebDateToSubmitDate(this.post('from'));
    const to = this.service('date', 'api').convertWebDateToSubmitDate(this.post('to'));
    let userId = this.post('userId');
    const user = this.getLoginUser();
    if (user.type === 'admin' || user.type === 'tggly') {
      userId = null;
    }
    const list = await this.model('group').sumGroup(from, to, userId);
    const obj = {};
    _.each(list, (item) => {
      obj[item.date] = item.sum;
    });
    this.json(obj);
  }

  async groupCountByYearAction() {
    const from = this.service('date', 'api').convertWebDateToSubmitDate(this.post('from'));
    const to = this.service('date', 'api').convertWebDateToSubmitDate(this.post('to'));
    let userId = this.post('userId');
    const user = this.getLoginUser();
    if (user.type === 'admin' || user.type === 'tggly') {
      userId = null;
    }
    const list = await this.model('group').countGroup(from, to, userId);
    const returnListKey = [];
    const returnListDate = [];
    let countSum = 0;
    _.each(list, (item) => {
      returnListKey.push(item.date);
      returnListDate.push(item.count);
      countSum += item.count;
    });
    this.json({'sum': countSum, 'x': returnListKey, 'y': returnListDate});
  }
  async groupUserListAction() {
    const from = this.service('date', 'api').convertWebDateToSubmitDate(this.post('from'));
    const to = this.service('date', 'api').convertWebDateToSubmitDate(this.post('to'));
    const limit = this.post('limit');
    let userId = this.post('userId');
    const user = this.getLoginUser();
    if (user.type === 'admin' || user.type === 'tggly') {
      userId = null;
    }
    const list = await this.model('group').countGroupUserList(from, to, userId, limit);
    this.json(list);
  }
  async groupSupplierListAction() {
    const from = this.service('date', 'api').convertWebDateToSubmitDate(this.post('from'));
    const to = this.service('date', 'api').convertWebDateToSubmitDate(this.post('to'));
    const limit = this.post('limit');
    let userId = this.post('userId');
    const user = this.getLoginUser();
    if (user.type === 'admin' || user.type === 'tggly') {
      userId = null;
    }
    const list = await this.model('group').countGroupSupplierList(from, to, userId, limit);
    this.json(list);
  }
  async groupMaterialListAction() {
    const from = this.service('date', 'api').convertWebDateToSubmitDate(this.post('from'));
    const to = this.service('date', 'api').convertWebDateToSubmitDate(this.post('to'));
    const limit = this.post('limit');
    const category = this.post('category');
    const list = await this.model('group').countGroupMaterialList(from, to, limit, category);
    this.json(list);
  }
  async userListByProvinceAction() {
    const user = this.getLoginUser();
    const limit = this.post('limit');
    if (user.type === 'admin' || user.type === 'yhgly') {
      const list = await this.model('user').userListByProvince(limit);
      const obj = {};
      _.each(list, (item) => {
        obj[item.province] = item.count;
      });
      this.json(obj);
    } else {
      this.json({});
    }
  }
  async userCityListByProvinceAction() {
    const user = this.getLoginUser();
    if (user.type === 'admin' || user.type === 'yhgly') {
      const list = await this.model('user').userCityListByProvince(this.post('province'));
      this.json(list);
    } else {
      this.json({});
    }
  }
};
