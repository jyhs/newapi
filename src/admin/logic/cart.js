module.exports = class extends think.Logic {
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  getByGroupIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  getCurrentCartByGroupIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  deleteDetailAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true}
    };
  }
  damageAddAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true},
      billDetailNum: {int: true, required: true, trim: true},
      sum: {int: true, required: true, trim: true},
      freight: {int: true, required: true, trim: true}
    };
  }
  lostAddAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true},
      billDetailNum: {int: true, required: true, trim: true},
      sum: {int: true, required: true, trim: true},
      freight: {int: true, required: true, trim: true}
    };
  }
  lostSubAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true},
      billDetailNum: {int: true, required: true, trim: true},
      sum: {int: true, required: true, trim: true},
      freight: {int: true, required: true, trim: true}
    };
  }
  damageSubAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true},
      billDetailNum: {int: true, required: true, trim: true},
      sum: {int: true, required: true, trim: true},
      freight: {int: true, required: true, trim: true}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      status: {int: true, trim: true},
      sum: {int: true, trim: true},
      isConfirm: {int: true, trim: true},
      freight: {float: true, trim: true},
      phone: {string: true, trim: true},
      address: {string: true, trim: true},
      province: {string: true, trim: true},
      city: {string: true, trim: true},
      contacts: {string: true, trim: true},
      description: {string: true, trim: true}
    };
  }
  updateDetailAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true},
      billDetailNum: {int: true, required: true, trim: true}
    };
  }
  addDetailAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true},
      billDetailNum: {int: true, required: true, trim: true},
      sum: {float: true, required: true, trim: true},
      freight: {float: true, required: true, trim: true}
    };
  }
  addOrUpdateDetailAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true},
      billDetailNum: {int: true, required: true, trim: true},
      sum: {float: true, required: true, trim: true},
      freight: {float: true, required: true, trim: true}
    };
  }
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, required: true, trim: true},
      size: {int: true, required: true, trim: true}
    };
  }
  listByGroupIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      page: {int: true, required: true, trim: true},
      size: {int: true, required: true, trim: true}
    };
  }
  getAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true}
    };
  }
  listDetailAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      page: {int: true, required: true, trim: true},
      size: {int: true, required: true, trim: true}
    };
  }
};
