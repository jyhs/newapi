const moment = require('moment');
module.exports = class extends think.Logic {
  async uploadAction() {
    this.allowMethods = 'post';
    this.rules = {
      bill_name: {string: true, trim: true, default: '礁岩海水团单'},
      user_id: {int: true, required: true, trim: true},
      supplier_id: {int: true, trim: true},
      effort_date: {date: true, required: true},
      bill: {method: 'file', required: true}
    };
    const user = await this.model('user').where({ id: this.post('user_id') }).find();
    if (think.isEmpty(user)) {
      this.fail('该用户不存在');
    } else if (user.type === 'pfs' || user.type === 'tggly') {
      if (!moment(this.post('effort_date') + '', 'YYYYMMDDhmmss').isAfter(moment())) {
        this.fail('生效日期必须大于今天');
      }
    } else {
      this.fail('权限不足');
    }
  }
};
