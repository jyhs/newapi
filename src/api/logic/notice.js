module.exports = class extends think.Logic {
  addAction() {
    this.rules = {
      notice_id: {int: true, required: true, trim: true}
    };
  }
  checkAction() {
    this.rules = {
      notice_id: {int: true, required: true, trim: true}
    };
  }
  publishAction() {
    this.allowMethods = 'post';
    this.rules = {
      img: {method: 'file', required: true}
    };
  }
};
