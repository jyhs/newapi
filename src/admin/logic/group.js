module.exports = class extends think.Logic {
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      province: {string: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true, required: true},
      endDate: {date: true, required: true},
      billId: {int: true, required: true, trim: true},
      freight: {float: true, required: true, trim: true},
      city: {string: true, trim: true, default: 'china'},
      province: {string: true, trim: true, default: 'china'},
      description: {string: true, trim: true, default: '这个团长很懒开团都不写描述。'},
      topFreight: {int: true, trim: true},
      private: {int: true, trim: true, default: 0}
    };
  }
  backAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  nextAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  downloadAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  finishAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  privateQrAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  reopenAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      endDate: {date: true, required: true}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true},
      endDate: {date: true},
      freight: {float: true, trim: true},
      city: {string: true, trim: true},
      province: {string: true, trim: true},
      activityCode: {string: true, trim: true},
      description: {string: true, trim: true},
      topFreight: {int: true, trim: true},
      status: {int: true, trim: true},
      groupId: {int: true, required: true, trim: true},
      private: {int: true, trim: true}
    };
  }
};
