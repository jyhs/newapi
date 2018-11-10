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
  getNewline(str) {
    let bytesCount = 0;
    let returnStr = '';
    for (var i = 0, n = str.length; i < n; i++) {
      var c = str.charCodeAt(i);
      if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
        bytesCount += 1;
      } else {
        bytesCount += 2;
      }
      returnStr += str.charAt(i);
      if (bytesCount >= 20) {
        returnStr = returnStr + '\n';
        bytesCount = 0;
      }
    }
    return returnStr;
  }
};
