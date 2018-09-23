import fs from 'fs';
import https from 'https';
const options = {
  key: fs.readFileSync('/Users/tony/Work/2_huanjiaohu.com.key'),
  cert: fs.readFileSync('/Users/tony/Work/1_huanjiaohu.com_bundle.crt')
};
const app = (callback, port, host, think) => {
  const server = https.createServer(options, callback);
  server.listen(port, host);
  return server;
};
module.exports = {
  default_module: 'api',
  defaultErrno: 406,
  port: 443,
  validateDefaultErrno: 406,
  createServer: app,
  weixin: {
    appid: 'wx6689f1d6479c5425', // 小程序 appid
    secret: '43f4cbef1445051cbbd4edb6c23b0fa2', // 小程序密钥
    mch_id: '', // 商户帐号ID
    partner_key: '', // 微信支付密钥
    notify_url: '', // 微信异步通知，例：https://www.nideshop.com/api/pay/notify
    accessKeyId: '1400101084', // 短信key
    secretAccessKey: '7c1e62752a6cd88719ef61cbf3b93ccb'// 短信key
  },
  express: {
    // 快递物流信息查询使用的是快递鸟接口，申请地址：http://www.kdniao.com/
    appid: '', // 对应快递鸟用户后台 用户ID
    appkey: '', // 对应快递鸟用户后台 API key
    request_url: 'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx'
  }

};
