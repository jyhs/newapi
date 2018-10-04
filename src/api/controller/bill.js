const Base = require('./base.js');
const _ = require('lodash');
const moment = require('moment');

module.exports = class extends Base {
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';

    const model = this.model('bill').alias('b');
    model.field(['b.*', 'u.name supplier_name']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['b.supplier_id', 'u.id']
    });
    const where = name ? {'b.name': ['like', `%${name}%`], 'b.is_one_step': 0} : {'b.is_one_step': 0};
    const list = await model.where(where).order(['b.effort_date DESC']).page(page, size).countSelect();
    _.each(list.data, (item) => {
      if (moment(item['effort_date']).isAfter(moment())) {
        item['status'] = 1;
      } else {
        item['status'] = 0;
      }
    });
    return this.json(list);
  }
  async getByIdAction() {
    const id = this.get('id');
    const model = this.model('bill');
    const list = await model.where({id: id}).select();
    return this.json(list);
  }
};
