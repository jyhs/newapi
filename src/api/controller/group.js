const Base = require('./base.js');
module.exports = class extends Base {
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';
    const list = await this.model('group').getGroupList({name, page, size});
    return this.json(list);
  }
  async activityAction() {
    this.json([
      {'code': 'default', 'name': '热团中', 'desc': ''},
      {'code': 'cx', 'name': '9月狂欢', 'desc': ''},
      {'code': 'jp', 'name': '精品推荐', 'desc': ''}
    ]);
  }
};
