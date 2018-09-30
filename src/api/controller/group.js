const Base = require('./base.js');
module.exports = class extends Base {
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';
    const list = await this.model('group').getGroupList({name, page, size});
    return this.json(list);
  }
};
