const Base = require('./base.js');
const _ = require('lodash');
module.exports = class extends Base {
  async getChinaAction() {
    const provinces = await this.model('provinces').select();
    const citys = await this.model('citys').select();
    _.each(provinces, (province) => {
      province['parent'] = 0;
    });
    _.each(citys, (city) => {
      if (city.type === 2) {
        provinces.push({'code': city.mark, 'name': city.name, 'parent': city.area});
      }
    });
    this.json(provinces);
  }
  async getCityByCodeAction() {
    const city = await this.model('citys').where({'mark': this.post('code')}).find();
    this.json(city);
  }
  async getCodeByCityAction() {
    const city = await this.model('citys').where({'name': this.post('city'), 'type': 2}).find();
    this.json(city);
  }
  async getCityByProvinceAction() {
    const citys = await this.model('citys').where({'area': this.post('province')}).select();
    this.json(citys);
  }
  async getProvincesAction() {
    const provinces = await this.model('provinces').select();
    this.json(provinces);
  }
  async getProvincesByCodeAction(code) {
    const provinces = await this.model('provinces').where({'code': this.post('code')}).find();
    this.json(provinces);
  }
};
