const Base = require('./base.js');
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
    const userId = this.post('user_id');
    const param = this.post('param');
    const date = this.post('date');
    const list = await this.model('share').where({'user_id': userId, 'param': param, 'insert_date': date}).select();
    this.json(list);
  }
};
