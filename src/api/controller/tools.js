const Base = require('./base.js');
const QcloudSms = require('qcloudsms_js');

module.exports = class extends Base {
  async sendVerificationAction() {
    const accessKeyId = think.config('weixin.accessKeyId');
    const secretAccessKey = think.config('weixin.secretAccessKey');
    const qcloudsms = QcloudSms(accessKeyId, secretAccessKey);
    const code = parseInt(Math.random() * 9000 + 1000);
    const ssender = qcloudsms.SmsSingleSender();
    const params = [code + ''];
    return new Promise((resolve, reject) => {
      ssender.sendWithParam(86, this.get('phone'), 140767, params, '', '', '', (err, res, resData) => {
        if (err) {
          reject(this.fail('发送失败'));
        } else {
          this.cache(resData.sid, code, {
            timeout: 5 * 60 * 1000
          });
        }
        resolve(this.success({'requestId': resData.sid}));
      });
    });
  }
};
