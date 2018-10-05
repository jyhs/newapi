
const Base = require('./base.js');
const fs = require('fs');
module.exports = class extends Base {
  async getNumberAction() {
    const dir = think.config('image.ad') + '/' + this.post('province') + '/';
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, files) => {
        if (err) {
          console.error(err);
          reject(this.fail('操作失败'));
        } else {
          let maxId = 0;
          files.forEach((itm, index) => {
            const filedId = itm.split('.')[0];
            if (Number(filedId) >= maxId) {
              maxId = Number(filedId);
            }
          });
          resolve(this.json({'ad_num': maxId}));
        }
      });
    });
  }
};
