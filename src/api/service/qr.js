const qr = require('qr-image');

module.exports = class extends think.Service {
  getQrByUrl(url) {
    return qr.imageSync(url, { type: 'svg' });
  }
  getGroupQrById(id, isPrivate) {
    const url = this.buildGroupUrl(id, isPrivate);
    return this.getQrByUrl(url);
  }
  buildGroupUrl(id, isPrivate) {
    let url = null;
    if (isPrivate) {
      url = `https://group.huanjiaohu.com/#/groupShop/${id}`;
    } else {
      url = `https://group.huanjiaohu.com/#/groupShop/${id}?private=${id}`;
    }
    return url;
  }
};
