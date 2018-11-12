const Base = require('./base.js');
const { createCanvas } = require('canvas');
const fs = require('fs');
const images = require('images');

module.exports = class extends Base {
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';
    const province = this.post('province');
    const list = await this.model('group').getGroupList({name, page, size, province});
    return this.json(list);
  }
  async getAction() {
    const group = await this.model('group').getGroup(this.post('groupId'));
    if (group) {
      group['end_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(group['end_date']);
    }
    return this.json(group);
  }
  async activityAction() {
    this.json([
      {'code': 'default', 'name': '热团中', 'desc': ''},
      {'code': 'cx', 'name': '9月狂欢', 'desc': ''},
      {'code': 'jp', 'name': '精品推荐', 'desc': ''}
    ]);
  }
  async imageAction() {
    const canvas = createCanvas(300, 120);
    const ctx = canvas.getContext('2d');

    ctx.font = '14px "Microsoft YaHei"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('', 50, 100);
    ctx.fillText(this.getNewline('全国满200元起发货包装费20元按货单满2500元打88折'), 84, 24, 204);
    fs.writeFileSync('/Users/tony/Documents/2.png', canvas.toBuffer());
    images('/Users/tony/Documents/1.jpg').draw(images('/Users/tony/Documents/2.png'), 10, 50).save('/Users/tony/Documents/3.png');
  }
};
