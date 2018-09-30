const Base = require('./base.js');
const fs = require('fs');
module.exports = class extends Base {
  async addAction() {
    const dir = think.config('image.ad') + '/' + this.get('province') + '/';
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(err);
        this.fail('操作失败');
      }
      let maxId = 1;
      files.forEach((itm, index) => {
        const filedId = itm.split('.')[0];
        if (Number(filedId) >= maxId) {
          maxId = Number(filedId);
        }
      });
      this.success('操作成功');
    });
  }
};
