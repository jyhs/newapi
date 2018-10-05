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
};
