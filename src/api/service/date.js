
module.exports = class extends think.Service {
  convertWebDateToSubmitDate(dateString) {
    const d = new Date(dateString);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + (d.getHours() > 9 ? d.getHours() : '0' + d.getHours()) + ':' + (d.getMinutes() > 9 ? d.getMinutes() : '0' + d.getMinutes()) + ':' + (d.getSeconds() > 9 ? d.getSeconds() : '0' + d.getSeconds());
  }
};
