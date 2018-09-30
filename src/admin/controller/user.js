const Base = require('./base.js');
module.exports = class extends Base {
  async updateAction() {
    return this.controller('user', 'api').updateAction(this.post('id'));
  }
  async getAvatarAction() {
    return this.controller('user', 'api').getAvatarAction(this.post('id'));
  }
};
