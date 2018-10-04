const Base = require('./base.js');
const _ = require('lodash');

module.exports = class extends Base {
  async deleteAction() {
    await this.model('bill_detail').where({id: this.get('bill_detail_id')}).delete();
  }
  async updateAction() {
    const detailObj = {
      size: this.post('size'),
      price: this.post('price'),
      point: this.post('point'),
      numbers: this.post('numbers'),
      limits: this.post('limits'),
      recommend: this.post('recommend')
    };
    await this.model('bill_detail').where({id: this.post('id')}).update(detailObj);
  }
  async addAction(detailParam) {
    const detailObj = detailParam || {
      name: this.post('name'),
      size: this.post('size'),
      price: this.post('price'),
      point: this.post('point'),
      numbers: this.post('numbers'),
      limits: this.post('limits'),
      bill_id: this.post('bill_id'),
      recommend: this.post('recommend')
    };
    const detail = await this.model('bill_detail').where({name: detailObj.name, size: detailObj.size}).find();
    if (!think.isEmpty(detail)) {
      this.fail('名字和大小一样的鱼已经存在');
    } else {
      const fishName = detailObj['name'].match(/[\u4e00-\u9fa5]/g);
      let name = fishName ? fishName.join('') : detailObj['name'];
      name = _.trim(name);
      const material = await this.model('material').where({ name: name }).find();
      if (think.isEmpty(material)) {
        const likeMaterial = await this.model('material').where({ tag: ['like', `%${name}%`] }).select();
        if (think.isEmpty(likeMaterial)) {
          await this.model('bill_detail').add(detailObj);
        } else {
          let matchId = likeMaterial[0].id;
          _.each(likeMaterial, (re) => {
            const id = re['id'];
            const tags = re['tag'];
            _.each(tags.split(','), (tag) => {
              if (name === tag) {
                matchId = id;
              }
            });
          });
          detailObj['material_id'] = matchId;
          await this.model('bill_detail').add(detailObj);
        }
      } else {
        detailObj['material_id'] = material.id;
        await this.model('bill_detail').add(detailObj);
      }
    }
  }
};
