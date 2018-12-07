const Base = require('./base.js');
const XLSX = require('xlsx');
const moment = require('moment');
const _ = require('lodash');
const parse = require('url-parse');
const rp = require('request-promise');

module.exports = class extends Base {
  async addAction() {
    const file = think.extend({}, this.file('bill'));
    const urlObj = parse(decodeURI(this.ctx.url), true);
    const userId = this.getLoginUserId();
    const billName = urlObj.query.name;
    const _effortDate = urlObj.query.effortDate;
    const supplierId = urlObj.query.supplierId;
    const isOneStep = urlObj.query.isOneStep || 0;
    const description = urlObj.query.description;
    const effortDate = this.service('date', 'api').convertWebDateToSubmitDateTime(_effortDate);
    const user = this.getLoginUser();
    if (_.isEmpty(billName)) {
      this.fail('单子名字不能为空');
    } else if (_.isEmpty(effortDate)) {
      this.fail('生效日不能为空');
    } else if (_.isEmpty(supplierId)) {
      this.fail('供应商不能为空');
    } else if (!moment(effortDate).isAfter(moment())) {
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

      let isBreakRow = 0;
      if (flag) {
        for (let row = 2; ; row++) {
          if (sheet['A' + row] == null) {
            if (isBreakRow >= 10) {
              break;
            } else {
              isBreakRow++;
              continue;
            }
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
          const fish = _.find(list, (f) => {
            return f.name === item.name && f.size === item.size && Number(f.price) === Number(item.price);
          });
          if (!fish) {
            list.push(item);
          } else {
            errorList.push(`有多个名字是${fish.name}尺寸是${fish.size}价格是${fish.price}的生物`);
          }
        }
      }
      const resault = {'flag': flag, 'list': list, 'error': errorList};
      const resaultlist = resault.list;
      const length = _.size(resaultlist);
      if (resault.flag) {
        if (_.size(resault.error) > 0) {
          this.fail(resault.error.join('<br>'));
        } else {
          const bill = {
            name: billName,
            user_id: userId,
            contacts: user.name,
            phone: user.phone,
            effort_date: effortDate,
            supplier_id: supplierId,
            description: description,
            is_one_step: isOneStep
          };
          const billId = await this.model('bill').add(bill);
          bill['id'] = billId;
          for (let i = 1; i <= length; i++) {
            const detail = resaultlist[i - 1];
            detail['bill_id'] = billId;
            detail['user_id'] = userId;

            await this.detailAddAction(detail);

            if (i === length) {
              const wexinService = this.service('weixin', 'api');
              const userList = await this.model('user').where({type: ['IN', ['cjyy', 'cjtz']]}).select();
              const token = await wexinService.getToken();
              _.each(userList, (item) => {
                if (!think.isEmpty(item['openid'])) {
                  wexinService.sendAddBillMessage(_.values(token)[0], item, bill);
                }
              });
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
    const groupList = await this.model('group_bill').where({bill_id: this.post('billId')}).select();
    if (think.isEmpty(groupList)) {
      await this.model('bill_detail').where({bill_id: this.post('billId')}).delete();
      await this.model('bill').where({id: this.post('billId')}).delete();
    } else {
      const group = _.find(groupList, (item) => {
        return Number(item.status) === 1;
      });
      if (think.isEmpty(group)) {
        await this.model('bill_detail').where({bill_id: this.post('billId')}).delete();
        await this.model('bill').where({id: this.post('billId')}).delete();
      } else {
        this.fail('团购还没有结束不能删除');
      }
    }
  }
  async updateAction() {
    const effortDate = this.post('effortDate') ? this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('effortDate')) : null;
    await this.model('bill').where({id: this.post('billId')}).update({
      name: this.post('billName'),
      effort_date: effortDate,
      description: this.post('description'),
      supplier_id: this.post('supplierId')
    });
  }
  async detailDeleteAction() {
    await this.model('bill_detail').where({id: this.post('billDetailId')}).delete();
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
    await this.model('bill_detail').where({id: this.post('detailId')}).update(detailObj);
  }
  async detailAddAction(detailParam) {
    const detailObj = detailParam || {
      name: this.post('name'),
      size: this.post('size'),
      price: this.post('price'),
      point: this.post('point'),
      numbers: this.post('numbers'),
      limits: this.post('limits'),
      bill_id: this.post('billId'),
      recommend: this.post('recommend')
    };
    const fishName = detailObj['name'].match(/[\u4e00-\u9fa5]/g);
    let name = fishName ? fishName.join('') : detailObj['name'];
    // name = _.trim(name.split(/\s+/)[0]);
    name = _.trim(name);
    const material = await this.model('material').where({ name: name }).find();
    if (think.isEmpty(material)) {
      const likeMaterial = await this.model('material').where({ tag: ['like', `%${name}%`] }).select();
      if (think.isEmpty(likeMaterial)) {
        const options = {
          method: 'GET',
          url: 'http://api.pullword.com/get.php',
          qs: {
            source: name,
            param1: 0,
            param2: 0
          }
        };
        const wordList = await rp(options);
        if (String(_.trim(wordList)) === 'error') {
          await this.model('bill_detail').add(detailObj);
        } else {
          let flag = true;
          for (const item of wordList) {
            const material = await this.model('material').where({ name: item }).find();
            if (think.isEmpty(material)) {
              const likeMaterial = await this.model('material').where({ tag: ['like', `%${item}%`] }).select();
              if (!think.isEmpty(likeMaterial)) {
                let matchId = likeMaterial[0].id;
                _.each(likeMaterial, (re) => {
                  const id = re['id'];
                  const tags = re['tag'];
                  _.each(tags.split(','), (tag) => {
                    if (item === tag) {
                      matchId = id;
                    }
                  });
                });
                detailObj['material_id'] = matchId;
                await this.model('bill_detail').add(detailObj);
                flag = false;
                break;
              }
            } else {
              detailObj['material_id'] = material.id;
              await this.model('bill_detail').add(detailObj);
              flag = false;
              break;
            }
          }
          if (flag) {
            await this.model('bill_detail').add(detailObj);
          }
        }
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
};
