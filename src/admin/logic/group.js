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
  backAction() {
    this.allowMethods = 'post';
    this.rules = {
      group_id: {int: true, required: true, trim: true}
    };
  }
  nextAction() {
    this.allowMethods = 'post';
    this.rules = {
      group_id: {int: true, required: true, trim: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      group_id: {int: true, required: true, trim: true}
    };
  }
  downloadAction() {
    this.allowMethods = 'post';
    this.rules = {
      group_id: {int: true, trim: true}
    };
  }
  finishAction() {
    this.allowMethods = 'post';
    this.rules = {
      group_id: {int: true, trim: true}
    };
  }
  privateQrAction() {
    this.allowMethods = 'post';
    this.rules = {
      group_id: {int: true, trim: true}
    };
  }
  reopenAction() {
    this.allowMethods = 'post';
    this.rules = {
      group_id: {int: true, trim: true},
      end_date: {date: true, required: true}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true},
      end_date: {date: true},
      bill_id: {int: true, trim: true},
      freight: {float: true, trim: true},
      city: {string: true, trim: true},
      province: {string: true, trim: true},
      activity_code: {string: true, trim: true},
      description: {string: true, trim: true},
      top_freight: {int: true, trim: true},
      status: {int: true, trim: true},
      group_id: {int: true, required: true, trim: true},
      private: {int: true, trim: true}
    };
  }
};
