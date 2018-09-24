const qr = require('qr-image');

module.exports = class extends think.Service {
  getQrByUrl(url) {
    return qr.imageSync(url, { type: 'svg' });
  }
  getGroupQrById(id) {
    const url = this.buildGroupUrl(id);
    return this.getQrByUrl(url);
  }
  buildGroupUrl(id) {
    const code = id + '';
    let c = String.fromCharCode(code.charCodeAt(0) + code.length);
    for (let i = 1; i < code.length; i++) {
      c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
    }
    c = escape(c.split('').join(' '));
    const url = `https://group.huanjiaohu.com/?#/buy/${c}/page`;
    return url;
  }
};
