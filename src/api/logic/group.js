module.exports = class extends think.Logic {
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true, required: true},
      end_date: {date: true, required: true},
      bill_id: {int: true, required: true, trim: true},
      freight: {float: true, required: true, trim: true},
      city: {string: true, trim: true, default: 'china'},
      province: {string: true, trim: true, default: 'china'},
      description: {string: true, trim: true, default: '这个团长很懒开团都不写描述。'},
      top_freight: {int: true, trim: true},
      private: {int: true, trim: true, default: 0}
    };
  }
  listAction() {
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      size: {int: true, trim: true}
    };
  }
};
