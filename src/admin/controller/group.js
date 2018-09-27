const Base = require('../../common/controller/base.js');
const moment = require('moment');
module.exports = class extends Base {
  async addAction() {
    const user = this.getLoginUser();
    if (think.isEmpty(user)) {
      this.fail('该用户不存在');
    } else if (user.type !== 'yy') {
      if (!moment(this.post('end_date') + '', 'YYYYMMDDhmmss').isAfter(moment())) {
        this.fail('结束日期必须大于今天');
      } else {
        const groupId = await this.model('group_bill').add({
          name: this.post('name'),
          contacts: user.name,
          phone: user.phone,
          end_date: this.post('end_date'),
          pickup_address: '',
          pickup_date: new Date(),
          pay_type: 0,
          pay_name: '',
          freight: this.post('freight'),
          description: this.post('description'),
          bill_id: this.post('bill_id'),
          user_id: user.id,
          city: this.post('city'),
          province: this.post('province'),
          private: this.post('private'),
          top_freight: this.post('top_freight')
        });
        const qrService = this.service('qr', 'api');
        this.type = 'image/svg+xml';
        console.log(qrService.getGroupQrById(groupId));
        this.body = qrService.getGroupQrById(groupId);
      }
    } else {
      this.fail('权限不足');
    }
  }
};
