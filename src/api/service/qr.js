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
    const code = id + '';
    let c = String.fromCharCode(code.charCodeAt(0) + code.length);
    for (let i = 1; i < code.length; i++) {
      c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
    }
    c = escape(c.split('').join(' '));
    let url = null;
    if (isPrivate) {
      url = `https://group.huanjiaohu.com/?#/buy/${c}/page`;
    } else {
      url = `https://group.huanjiaohu.com/?#/buy/${c}/page?private=${id}`;
    }
    return url;
  }
};
