const Base = require('./base.js');
const moment = require('moment');
const _ = require('lodash');
const xlsx = require('node-xlsx');
const fs = require('fs');
module.exports = class extends Base {
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';
    const userId = this.getLoginUserId();
    const list = await this.model('group').getUserGroupList({name, page, size, userId});
    return this.json(list);
  }
  async reopenAction() {
    const effortDate = this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('endDate'));
    const endDate = moment(effortDate).add(1, 'days').format(this.config('date_format'));
    await this.model('group_bill').where({id: this.post('groupId')}).update({status: 1, end_date: endDate});
    this.success(true);
  }
  async privateQrAction() {
    const groupId = this.post('groupId');
    const qrService = this.service('qr', 'api');
    this.type = 'image/svg+xml';
    this.body = qrService.getGroupQrById(groupId, true);
  }
  async finishAction() {
    await this.model('group_bill').where({id: this.post('groupId')}).update({status: 0});
    this.success(true);
  }
  async backAction() {
    const group = await this.model('group_bill').where({id: this.post('groupId')}).find();
    group.current_step = group.current_step - 1;
    await this.model('group_bill').where({id: this.post('groupId')}).update({current_step: group.current_step});
  }
  async nextAction() {
    const group = await this.model('group_bill').where({id: this.post('groupId')}).find();
    if (Number(group.status) === 1) {
      this.fail('请先结束团购');
    } else {
      const cart = await this.model('cart').field('count(is_pay) count').where({status: 1, is_pay: 0, is_confirm: 1, sum: ['!=', 0], group_bill_id: this.post('groupId')}).find();
      if (cart.count > 0) {
        this.fail('鱼友尚未全部支付');
      } else {
        group.current_step = group.current_step + 1;
        await this.model('group_bill').where({id: this.post('groupId')}).update({current_step: group.current_step});
      }
    }
  }
  async deleteAction() {
    await this.model('group').delete(this.post('groupId'));
    await this.model('cart').where({'group_bill_id': this.post('groupId')}).delete();
    await this.model('group_bill').where({'id': this.post('groupId')}).delete();
  }
  async addAction() {
    const user = this.getLoginUser();
    const effortDate = this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('endDate'));
    if (!moment(effortDate).isAfter(moment())) {
      this.fail('结束日期必须大于今天');
    } else {
      const groupId = await this.model('group_bill').add({
        name: this.post('name'),
        contacts: user.name,
        phone: user.phone,
        end_date: moment(effortDate).format(this.config('date_format')),
        pickup_address: '',
        pickup_date: new Date(),
        pay_type: 0,
        pay_name: '',
        freight: this.post('freight'),
        description: this.post('description'),
        bill_id: this.post('billId'),
        user_id: user.id,
        city: this.post('city'),
        province: this.post('province'),
        private: this.post('private'),
        top_freight: this.post('topFreight')
      });
      const qrService = this.service('qr', 'api');
      this.type = 'image/svg+xml';
      this.body = qrService.getGroupQrById(groupId, false);
    }
  }
  async updateAction() {
    const group = this.model('group_bill').where({'id': this.post('groupId')}).find();
    const effortDate = this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('endDate'));
    if (this.post('endDate') && !moment(effortDate).isAfter(moment())) {
      this.fail('结束日期必须大于今天');
    } else if (Number(group.status) === 0) {
      this.fail('已经结束的团购单不能更新');
    } else {
      await this.model('group_bill').where({id: this.post('groupId')}).update({
        name: this.post('name'),
        end_date: this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('endDate')),
        freight: this.post('freight'),
        description: this.post('description'),
        city: this.post('city'),
        province: this.post('province'),
        private: this.post('private'),
        top_freight: this.post('topFreight'),
        activity_code: this.post('activityCode'),
        status: this.post('status')
      });
      this.success(true);
    }
  }
  async downloadAction() {
    const group = await this.model('group_bill').where({'id': this.post('groupId')}).find();
    const returnData = [['序号', '昵称', '联系电话', '联系人', '联系地址', '合计', '备注', '品名', '规格', '单价', '数量', '共计（不含运费)']];
    const totleReturnData = [['品名', '规格', '单价', '数量', '共计（不含运费)']];
    const totleReturnDataWithfreight = [['品名', '规格', '单价', '数量', '生物总价', '生物运费', '缺货退费', '报损退费', '共计（含运费)']];
    const returnDataWithfreight = [['序号', '昵称', '联系电话', '联系人', '联系地址', '备注', '品名', '规格', '单价', '实际数量', '缺货数量', '报损数量', '缺货退款（含运费)', '报损退款', '应退款（含运费)', '应收款（含运费)']];
    const detailGroups = await this.model('group').detailGroup(this.post('groupId'));
    const summaryGroups = await this.model('group').summaryGroup(this.post('groupId'));
    let totleSum = 0;
    let totleSumWithfreight = 0;
    _.each(summaryGroups, (summaryGroup) => {
      const _itemList = [];
      const _itemListWithfreight = [];
      _itemList.push(summaryGroup.name);
      _itemListWithfreight.push(summaryGroup.name);
      _itemList.push(summaryGroup.size);
      _itemListWithfreight.push(summaryGroup.size);
      _itemList.push(summaryGroup.price);
      _itemListWithfreight.push(summaryGroup.price);
      _itemList.push(summaryGroup.bill_detail_num);
      _itemListWithfreight.push(summaryGroup.bill_detail_num);
      _itemList.push(summaryGroup.sum);
      _itemListWithfreight.push(summaryGroup.sum);
      _itemListWithfreight.push(summaryGroup.sum_freight);
      _itemListWithfreight.push('-' + summaryGroup.sum_lost_back);
      _itemListWithfreight.push('-' + summaryGroup.sum_damage_back);
      const sum = Number(summaryGroup.sum) + Number(summaryGroup.sum_freight) - Number(summaryGroup.sum_lost_back) - Number(summaryGroup.sum_damage_back);
      _itemListWithfreight.push(sum);
      totleSum += summaryGroup.sum;
      totleSumWithfreight += sum;
      totleReturnData.push(_itemList);
      totleReturnDataWithfreight.push(_itemListWithfreight);
    });
    const _itemList = [];
    _itemList.push('');
    _itemList.push('');
    _itemList.push('');
    _itemList.push('共计');
    _itemList.push(totleSum);
    totleReturnData.push(_itemList);

    const _itemListWithfreight = [];
    _itemListWithfreight.push('');
    _itemListWithfreight.push('');
    _itemListWithfreight.push('');
    _itemListWithfreight.push('');
    _itemListWithfreight.push('');
    _itemListWithfreight.push('');
    _itemListWithfreight.push('');
    _itemListWithfreight.push('共计');
    _itemListWithfreight.push(totleSumWithfreight);
    totleReturnDataWithfreight.push(_itemListWithfreight);

    const tempMap = new Map();
    const rangeList = [];
    _.each(detailGroups, (detailGroup) => {
      const itemList = tempMap.get(detailGroup.userName);
      if (itemList) {
        itemList.push(detailGroup);
      } else {
        const list = [detailGroup];
        tempMap.set(detailGroup.userName, list);
      }
    });
    let secquence = 1;
    tempMap.forEach((itemList, key, map) => {
      const _count = this.count(itemList);
      _.each(itemList, (item, index) => {
        const _itemList = [];
        const _itemListWithfreight = [];

        if (index === 0) {
          _itemList.push(secquence);
          _itemList.push(item.userName);
          _itemList.push(item.phone);
          _itemList.push(item.contacts);
          _itemList.push(item.province + (item.city ? item.city : '') + (item.address ? item.address : ''));
          _itemList.push(_count);
          _itemList.push(item.description);
          _itemListWithfreight.push(secquence);
          _itemListWithfreight.push(item.userName);
          _itemListWithfreight.push(item.phone);
          _itemListWithfreight.push(item.contacts);
          _itemListWithfreight.push(item.province + (item.city ? item.city : '') + (item.address ? item.address : ''));
          _itemListWithfreight.push(item.description);
          secquence++;
        } else {
          _itemList.push('');
          _itemList.push('');
          _itemList.push('');
          _itemList.push('');
          _itemList.push('');
          _itemList.push('');
          _itemList.push('');
          _itemListWithfreight.push('');
          _itemListWithfreight.push('');
          _itemListWithfreight.push('');
          _itemListWithfreight.push('');
          _itemListWithfreight.push('');
        }
        _itemList.push(item.name);
        _itemList.push(item.size);
        _itemList.push(item.price);
        _itemList.push(item.bill_detail_num);
        _itemList.push(item.sum);

        _itemListWithfreight.push(item.name);
        _itemListWithfreight.push(item.size);
        _itemListWithfreight.push(item.price);
        _itemListWithfreight.push(item.bill_detail_num);
        _itemListWithfreight.push(item.lost_num);
        _itemListWithfreight.push(item.damage_num);
        const lostBack = Number(item.lost_num) * Number(item.price) + Number(item.lost_back_freight);
        const damageBack = Number(item.damage_num) * Number(item.price);
        _itemListWithfreight.push('-' + lostBack);
        _itemListWithfreight.push('-' + damageBack);
        _itemListWithfreight.push('-' + (lostBack + damageBack));
        _itemListWithfreight.push(Number(_count) + Number(item.freight));

        returnData.push(_itemList);
        returnDataWithfreight.push(_itemListWithfreight);
      });
      returnData.push([]);
      returnDataWithfreight.push([]);
    });
    const name = 'coral123-' + group.id + '.xlsx';
    const path = this.config('image.bill') + '/' + name;

    // var buffer = xlsx.build([{name: "总单(不含运费)", data: totleReturnData},{name: "明细(不含运费)", data: returnData},{name: "总单(含运费)", data: totleReturnDataWithfreight},{name: "明细(含运费)", data: returnDataWithfreight}]);
    const buffer = xlsx.build([{name: '总单', data: totleReturnData}, {name: '明细', data: returnData}], {'!merges': rangeList});
    const ws = fs.createWriteStream(path);
    await ws.write(buffer, 'utf8');
    this.json({'name': name});
  }

  count(itemList) {
    let sum = 0;
    _.each(itemList, (item) => {
      sum += item.sum;
    });
    return sum;
  }
};
