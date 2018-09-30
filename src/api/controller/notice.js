const Base = require('./base.js');
const fs = require('fs');
module.exports = class extends Base {
  async addAction() {
    const notice = {
      user_id: this.getLoginUserId(),
      notice_id: this.get('notice_id')
    };
    await this.model('focus').add(notice);
    this.success('操作成功');
  }

  async checkAction() {
    const notice = await this.model('focus').where({'user_id': this.getLoginUserId(), 'notice_id': this.get('notice_id')}).find();
    if (think.isEmpty(notice)) {
      this.json({'checked': true});
    } else {
      this.json({'checked': false});
    }
  }

  async getAction() {
    const dir = think.config('image.notice');
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(err);
        this.fail('操作失败');
      }
      let maxId = 1;
      let defaultItem = '1.png';
      files.forEach((itm, index) => {
        const filedId = itm.split('.')[0];
        if (Number(filedId) >= maxId) {
          maxId = Number(filedId);
          defaultItem = itm;
        }
      });
      this.json({'notice_file': 'https://static.huanjiaohu.com/image/notice/' + defaultItem, 'notice_id': maxId});
    });
  }

  async publishAction() {
    const img = this.file('img');
    const dir = think.config('image.notice');
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, files) => {
        if (err) {
          console.error(err);
          reject(this.fail('操作失败'));
        }
        let maxId = 1;
        files.forEach((itm, index) => {
          const filedId = itm.split('.')[0];
          if (Number(filedId) >= maxId) {
            maxId = Number(filedId);
          }
        });
        const _name = img.name;
        const tempName = _name.split('.');
        const path = `${dir}${maxId + 1}.${tempName[1]}`;
        const file = fs.createWriteStream(path);
        file.on('error', (err) => {
          if (err) {
            reject(this.fail('创建文件失败'));
          }
        });

        img.pipe(file);

        img.on('end', (err) => {
          if (err) {
            reject(this.fail('操作失败'));
          }
          this.model('focus').where({'notice_id': ['!=', null]}).delete();
          resolve(this.success('操作成功'));
        });
      });
    });
  }
};
