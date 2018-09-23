const Base = require('./base.js');

module.exports = class extends Base {
  async uploadAction() {
    const excelFile = this.file('bill');
    const user_id = this.post('user_id');
    const bill_name = this.post('bill_name');
    const effort_date = this.post('effort_date');
    const supplier_id = this.post('supplier_id');
    const fileName = excelFile.name;

    console.log(fileName);
  }
};
