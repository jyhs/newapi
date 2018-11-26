const Base = require('./base.js');
const _ = require('lodash');

module.exports = class extends Base {
  async addAction() {
    const share = {
      user_id: this.getLoginUserId(),
      param: this.post('param'),
      encryptedData: this.post('encryptedData'),
      iv: this.post('iv')
    };
    await this.model('share').add(share);
  }
  async selectAction() {
    const userId = this.post('userId');
    const param = this.post('param');
    const date = this.post('date');
    const deleteItem = this.post('delete');
    const list = await this.model('share').where({'user_id': userId, 'param': param, 'insert_date': date}).select();
    if (deleteItem) {
      _.each(list, (item) => {
        this.model('share').where({'id': item.id}).delete();
      });
    }
    this.json(list);
  }
};
