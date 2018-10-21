
const Base = require('./base.js');
const fs = require('fs');
const _ = require('lodash');
module.exports = class extends Base {
  async getNumberAction() {
    const dir = think.config('image.ad') + '/' + this.post('province') + '/';
    const files = fs.readdirSync(dir);
    let maxId = 0;
    _.each(files, (itm) => {
      const filedId = itm.split('.')[0];
      if (Number(filedId) >= maxId) {
        maxId = Number(filedId);
      }
    });
    this.json({'ad_num': maxId});
  }
};
