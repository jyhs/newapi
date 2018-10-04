const Base = require('./base.js');
const fs = require('fs');
const images = require('images');

module.exports = class extends Base {
  async deleteImageAction() {
    const material = await this.model('material').where({id: this.get('id')}).find();
    const filePath = think.config('image.material') + '/' + material.category + '/' + this.get('imgName');
    fs.unlinkSync(filePath);
  }
  async deleteAction() {
    const material = await this.model('material').where({id: this.get('id')}).find();
    const filePath = think.config('image.material') + '/' + material.category + '/';
    fs.readdir(filePath, function(err, files) {
      if (err) {
        console.error(err);
        this.fail('操作失败');
      }
      const results = [];
      files.forEach(function(filename) {
        if (filename.indexOf(material.code) >= 0) {
          results.push(filename);
        }
      });
      results.forEach((file) => {
        fs.unlinkSync(filePath + '/' + file);
      });
    });
    await this.model('material').where({id: this.get('id')}).delete();
  }
  async addAction() {
    const tag = this.post('tag') ? this.post('tag').replace(/，/ig, ',') : '';
    const materialObj = {
      name: this.post('name'),
      ename: this.post('ename'),
      sname: this.post('sname'),
      category: this.post('category'),
      type: this.post('type'),
      tag: tag,
      code: this.post('code'),
      level: this.post('level'),
      price: this.post('price'),
      compatibility: this.post('compatibility'),
      description: this.post('description'),
      classification: this.post('description')
    };
    const material = await this.model('material').where({code: materialObj.code, category: materialObj.category}).find();
    if (!think.isEmpty(material)) {
      this.fail('编码已经存在');
    } else {
      const material = await this.model('material').where({name: materialObj.name, category: materialObj.category}).find();
      if (!think.isEmpty(material)) {
        this.fail('名字已经存在');
      } else {
        const id = await this.model('material').add(materialObj);
        this.json(({'id': id}));
      }
    }
  }
  async uploadAction() {
    const code = this.post('code');
    const category = this.post('category');
    const img = this.file('img');
    const _name = img.name;
    const tempName = _name.split('.');
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const name = timestamp + '-' + code + '.' + tempName[1];
    const path = think.config('image.material') + '/' + category + '/' + name;
    const smallPath = think.config('image.material') + '/small/' + category + '/' + name;
    const file = fs.createWriteStream(path);

    img.pipe(file);

    img.on('end', (err) => {
      if (err) {
        this.fail('操作失败');
      }
      const returnPath = `/${category}/${name}`;
      images(path).size(150).save(smallPath, {
        quality: 75
      });
      this.json({'imgPath': returnPath});
    });
  }
  async updateAction() {
    const tag = this.post('tag') ? this.post('tag').replace(/，/ig, ',') : '';
    const materialObj = {
      name: this.post('name'),
      ename: this.post('ename'),
      sname: this.post('sname'),
      category: this.post('category'),
      type: this.post('type'),
      tag: tag,
      code: this.post('code'),
      level: this.post('level'),
      price: this.post('price'),
      compatibility: this.post('compatibility'),
      description: this.post('description'),
      classification: this.post('description')
    };
    await this.model('material').where({id: this.post('id')}).update(materialObj);
  }
};
