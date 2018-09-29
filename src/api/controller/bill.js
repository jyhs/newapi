const Base = require('../../common/controller/base.js');
const XLSX = require('xlsx');
const _ = require('lodash');
const moment = require('moment');

module.exports = class extends Base {
  async uploadAction() {
    const file = think.extend({}, this.file('bill'));
    const userId = this.post('user_id');
    const billName = this.post('bill_name');
    const effortDate = this.post('effort_date');
    const supplierId = this.post('supplier_id');
    const user = this.getLoginUser();
    if (think.isEmpty(user)) {
      this.fail('该用户不存在');
    } else if (user.type === 'pfs' || user.type === 'tggly') {
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
              await this.insertBillDetail(resaultlist[i - 1], billId);
              if (i === length) {
                this.json({ 'bill_id': billId });
              }
            }
          }
        } else {
          this.fail('请使用下载的模版上传单子');
        }
      }
    } else {
      this.fail('权限不足');
    }
  }
  async insertBillDetail(billDetail, billId) {
    const fishName = billDetail['name'].match(/[\u4e00-\u9fa5]/g);
    let name = fishName ? fishName.join('') : billDetail['name'];
    name = _.trim(name);
    const material = await this.model('material').where({ name: name }).find();
    if (think.isEmpty(material)) {
      const likeMaterial = await this.model('material').where({ tag: ['like', `%${name}%`] }).select();
      if (think.isEmpty(likeMaterial)) {
        await this.model('bill_detail').add({
          bill_id: billId,
          name: name,
          size: billDetail['size'] ? billDetail['size'] : 0,
          price: billDetail.price,
          point: billDetail['point'] ? billDetail['point'] : 0,
          material_id: null,
          numbers: billDetail['numbers'] ? billDetail['numbers'] : 99,
          limits: billDetail['limits'] ? billDetail['limits'] : 99,
          recommend: billDetail['recommend']
        });
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
        await this.model('bill_detail').add({
          bill_id: billId,
          name: name,
          size: billDetail['size'] ? billDetail['size'] : 0,
          price: billDetail.price,
          point: billDetail['point'] ? billDetail['point'] : 0,
          material_id: matchId,
          numbers: billDetail['numbers'] ? billDetail['numbers'] : 99,
          limits: billDetail['limits'] ? billDetail['limits'] : 99,
          recommend: billDetail['recommend']
        });
      }
    } else {
      await this.model('bill_detail').add({
        bill_id: billId,
        name: name,
        size: billDetail['size'] ? billDetail['size'] : 0,
        price: billDetail.price,
        point: billDetail['point'] ? billDetail['point'] : 0,
        material_id: material.id,
        numbers: billDetail['numbers'] ? billDetail['numbers'] : 99,
        limits: billDetail['limits'] ? billDetail['limits'] : 99,
        recommend: billDetail['recommend']
      });
    }
  }
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
    const list = await model.where({'b.name': ['like', `%${name}%`], 'b.is_one_step': 0}).order(['b.effort_date DESC']).page(page, size).countSelect();
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
