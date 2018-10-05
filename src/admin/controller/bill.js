const Base = require('./base.js');
const XLSX = require('xlsx');
const moment = require('moment');
const _ = require('lodash');

module.exports = class extends Base {
  async addAction() {
    const file = think.extend({}, this.file('bill'));
    const userId = this.getLoginUserId();
    const billName = this.post('name');
    const effortDate = this.post('effort_date');
    const supplierId = this.post('supplier_id');
    const user = this.getLoginUser();
    if (!moment(this.post('effort_date') + '', 'YYYYMMDDhmmss').isAfter(moment())) {
      this.fail('生效日期必须大于今天');
    } else {
      const wb = XLSX.readFile(file.path);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const list = [];
      const errorList = [];

      let flag = false;
      if (sheet['A' + 1] && sheet['A' + 1]['v'] === '鱼名') {
        flag = true;
      } else {
        flag = false;
      }

      if (sheet['B' + 1] && sheet['B' + 1]['v'] === '尺寸') {
        flag = true;
      } else {
        flag = false;
      }

      if (sheet['C' + 1] && sheet['C' + 1]['v'] === '价格') {
        flag = true;
      } else {
        flag = false;
      }

      if (sheet['D' + 1] && sheet['D' + 1]['v'] === '积分') {
        flag = true;
      } else {
        flag = false;
      }

      if (flag) {
        for (let row = 2; ; row++) {
          if (sheet['A' + row] == null) {
            break;
          }
          const item = {};
          for (let col = 65; col <= 71; col++) {
            const c = String.fromCharCode(col);
            const key = '' + c + row;
            const value = sheet[key] ? _.trim(sheet[key]['w']) : null;
            switch (c) {
              case 'A':
                if (_.isEmpty(value)) {
                  errorList.push(`第${row}行鱼名不能为空`);
                } else if (_.size(value) > 30) {
                  errorList.push(`第${row}行叫${sheet['A' + row]['w']}的名字太长了`);
                } else {
                  item['name'] = _.trim(value);
                }
                break;
              case 'B':
                if (_.isEmpty(value)) {
                  item['size'] = '';
                } else if (_.size(value) > 30) {
                  errorList.push(`第${row}行叫${sheet['A' + row]['w']}的尺寸太长了`);
                } else {
                  item['size'] = _.trim(value);
                }
                break;
              case 'C':
                if (_.isEmpty(value)) {
                  errorList.push(`第${row}行叫${sheet['A' + row]['w']}的价格不能为空`);
                } else if (isNaN(Number(value))) {
                  errorList.push(`第${row}行叫${sheet['A' + row]['w']}的价格不是数字`);
                } else {
                  item['price'] = _.trim(value);
                }
                break;
              case 'D':
                if (_.isEmpty(value)) {
                  item['point'] = '';
                } else if (isNaN(Number(value))) {
                  errorList.push(`第${row}行叫${sheet['A' + row]['w']}的积分不是数字`);
                } else if (Number(value) > 100) {
                  errorList.push(`第${row}行叫${sheet['A' + row]['w']}的积分太多了`);
                } else {
                  item['point'] = _.trim(value);
                }
                break;
              case 'E':
                if (_.isEmpty(value)) {
                  item['numbers'] = '99';
                } else if (isNaN(Number(value))) {
                  errorList.push(`第${row}行叫${sheet['A' + row]['w']}的数量不是数字`);
                } else {
                  item['numbers'] = _.trim(value);
                }
                break;
              case 'F':
                if (_.isEmpty(value)) {
                  item['limits'] = '99';
                } else if (isNaN(Number(value))) {
                  errorList.push(`第${row}行叫${sheet['A' + row]['w']}的限购不是数字`);
                } else if (!_.isEmpty(item['numbers']) && Number(value) > Number(item['numbers'])) {
                  errorList.push(`第${row}行叫${sheet['A' + row]['w']}的限购数大于总数`);
                } else {
                  item['limits'] = _.trim(value);
                }
                break;
              case 'G':
                if (_.isEmpty(value)) {
                  item['recommend'] = '';
                } else {
                  item['recommend'] = _.trim(value);
                }
                break;
              default:
                break;
            }
          }
          list.push(item);
        }
      }
      const resault = {'flag': flag, 'list': list, 'error': errorList};
      const resaultlist = resault.list;
      const length = _.size(resaultlist);
      if (resault.flag) {
        if (_.size(resault.error) > 0) {
          this.fail(resault.error.join('\n'));
        } else {
          const billId = await this.model('bill').add({
            name: billName,
            user_id: userId,
            contacts: user.name,
            phone: user.phone,
            effort_date: effortDate,
            supplier_id: supplierId,
            description: ''
          });
          for (let i = 1; i <= length; i++) {
            const detail = resaultlist[i - 1];
            detail['bill_id'] = billId;
            detail['user_id'] = userId;
            await this.controller('detail', 'admin').addAction(detail);
            if (i === length) {
              return this.json({ 'bill_id': billId });
            }
          }
        }
      } else {
        this.fail('请使用下载的模版上传单子');
      }
    }
  }
  async deleteAction() {
    await this.model('bill_detail').where({bill_id: this.post('bill_id')}).delete();
    await this.model('bill').where({id: this.post('bill_id')}).delete();
  }

  async detailDeleteAction() {
    await this.model('bill_detail').where({id: this.post('bill_detail_id')}).delete();
  }
  async detailUpdateAction() {
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
  async detailAddAction(detailParam) {
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
