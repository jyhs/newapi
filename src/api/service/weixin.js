const crypto = require('crypto');
const md5 = require('md5');
const qs = require('querystring');
const https = require('https');
const _ = require('lodash');
const rp = require('request-promise');
module.exports = class extends think.Service {
  async getToken() {
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      qs: {
        grant_type: 'client_credential',
        secret: think.config('weixin.public_secret'),
        appid: think.config('weixin.public_appid')
      }
    };

    let sessionData = await rp(options);
    sessionData = JSON.parse(sessionData);
    return sessionData;
  }
  async sendSubscribeMessage() {
    const token = await this.service('weiixn').getToken();
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/template/subscribe?access_token=' + _.values(token)[0],
      body: {
        touser: this.post('openId'),
        template_id: 'MBKFHUw6G4vVktlxqxu4BGRzH8u9xSBRaMDL0dUBJfU',
        miniprogram: {
          'appid': 'wx9f635f06da7360d7',
          'pagepath': 'pages/index/index?type=group&id=1597'
        },
        scene: 1000,
        title: '测试title',
        data: {
          content: {
            value: '测试value',
            color: '#ff0000'
          }
        }
      },
      json: true
    };
    rp(options);
  }

  async sendOpenGroupMessage(user, group) {
    const token = await this.service('weiixn').getToken();
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + _.values(token)[0],
      body: {
        touser: user['open_id'],
        template_id: 'KuLyRiWNY-DTCKWdUzXQkkG5LOxTP-rNQ3Xjle-xDgg',
        miniprogram: {
          'appid': 'wx9f635f06da7360d7',
          'pagepath': 'pages/index/index?type=group&id=1597'
        },
        topcolor: '#FF0000',
        data: {'first': {'value': '礁岩海水 CEO 开团了', 'color': '#173177'}, 'keyword1': {'value': 'york 姚远 开团了', 'color': '#173177'}, 'keyword2': {'value': '2018-11-08', 'color': '#173177'}, 'remark': {'value': 'tony 太牛逼了', 'color': '#173177'}}
      },
      json: true
    };
    rp(options);
  }

  async sendOrderMessage(user, group, cart) {
    const token = await this.service('weiixn').getToken();
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + _.values(token)[0],
      body: {
        touser: user['open_id'],
        template_id: 'KuLyRiWNY-DTCKWdUzXQkkG5LOxTP-rNQ3Xjle-xDgg',
        miniprogram: {
          'appid': 'wx9f635f06da7360d7',
          'pagepath': 'pages/index/index?type=group&id=1597'
        },
        topcolor: '#FF0000',
        data: {'first': {'value': '礁岩海水 CEO 开团了', 'color': '#173177'}, 'keyword1': {'value': 'york 姚远 开团了', 'color': '#173177'}, 'keyword2': {'value': '2018-11-08', 'color': '#173177'}, 'remark': {'value': 'tony 太牛逼了', 'color': '#173177'}}
      },
      json: true
    };
    rp(options);
  }
  /**
   * 根据code获得用户信息
   * @param code
   * @returns {Promise.<string>}
   */
  async getUserInfoByCode(code) {
    const queryDate = {
      appid: think.config('weixin.mini_appid'),
      secret: think.config('weixin.mini_secret'),
      code: code,
      grant_type: 'authorization_code'
    };
    const content = qs.stringify(queryDate);
    const options = {
      hostname: 'api.weixin.qq.com',
      port: 443,
      path: '/sns/oauth2/access_token?' + content,
      method: 'GET',
      json: true,
      rejectUnauthorized: true
    };
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', async(userChunk) => {
          const userObject = JSON.parse(userChunk);
          if (!_.isEmpty(userObject.unionid)) {
            const user = await this.model('user').where({unionid: userObject.unionid}).find();
            if (!_.isEmpty(user)) {
              resolve(user);
            } else {
              resolve({});
            }
          } else {
            resolve({});
          }
        });
      });

      req.on('error', (e) => {
        reject(e.message);
      });

      req.end();
    });
  }
  /**
   * 解析微信登录用户数据
   * @param sessionKey
   * @param encryptedData
   * @param iv
   * @returns {Promise.<string>}
   */
  async decryptUserInfoData(sessionKey, encryptedData, iv) {
    // base64 decode
    const _sessionKey = Buffer.from(sessionKey, 'base64');
    encryptedData = Buffer.from(encryptedData, 'base64');
    iv = Buffer.from(iv, 'base64');
    let decoded = '';
    try {
      // 解密
      const decipher = crypto.createDecipheriv('aes-128-cbc', _sessionKey, iv);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      decoded = decipher.update(encryptedData, 'binary', 'utf8');
      decoded += decipher.final('utf8');

      decoded = JSON.parse(decoded);
    } catch (err) {
      return '';
    }

    if (decoded.watermark.appid !== think.config('weixin.mini_appid')) {
      return '';
    }

    return decoded;
  }

  /**
   * 统一下单
   * @param payInfo
   * @returns {Promise}
   */
  createUnifiedOrder(payInfo) {
    const WeiXinPay = require('weixinpay');
    const weixinpay = new WeiXinPay({
      appid: think.config('weixin.mini_appid'), // 微信小程序appid
      openid: payInfo.openid, // 用户openid
      mch_id: think.config('weixin.mch_id'), // 商户帐号ID
      partner_key: think.config('weixin.partner_key') // 秘钥
    });
    return new Promise((resolve, reject) => {
      weixinpay.createUnifiedOrder({
        body: payInfo.body,
        out_trade_no: payInfo.out_trade_no,
        total_fee: payInfo.total_fee,
        spbill_create_ip: payInfo.spbill_create_ip,
        notify_url: think.config('weixin.notify_url'),
        trade_type: 'JSAPI'
      }, (res) => {
        if (res.return_code === 'SUCCESS' && res.result_code === 'SUCCESS') {
          const returnParams = {
            'appid': res.appid,
            'timeStamp': parseInt(Date.now() / 1000) + '',
            'nonceStr': res.nonce_str,
            'package': 'prepay_id=' + res.prepay_id,
            'signType': 'MD5'
          };
          const paramStr = `appId=${returnParams.appid}&nonceStr=${returnParams.nonceStr}&package=${returnParams.package}&signType=${returnParams.signType}&timeStamp=${returnParams.timeStamp}&key=` + think.config('weixin.partner_key');
          returnParams.paySign = md5(paramStr).toUpperCase();
          resolve(returnParams);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 生成排序后的支付参数 query
   * @param queryObj
   * @returns {Promise.<string>}
   */
  buildQuery(queryObj) {
    const sortPayOptions = {};
    for (const key of Object.keys(queryObj).sort()) {
      sortPayOptions[key] = queryObj[key];
    }
    let payOptionQuery = '';
    for (const key of Object.keys(sortPayOptions).sort()) {
      payOptionQuery += key + '=' + sortPayOptions[key] + '&';
    }
    payOptionQuery = payOptionQuery.substring(0, payOptionQuery.length - 1);
    return payOptionQuery;
  }

  /**
   * 对 query 进行签名
   * @param queryStr
   * @returns {Promise.<string>}
   */
  signQuery(queryStr) {
    queryStr = queryStr + '&key=' + think.config('weixin.partner_key');
    const md5 = require('md5');
    const md5Sign = md5(queryStr);
    return md5Sign.toUpperCase();
  }

  /**
   * 处理微信支付回调
   * @param notifyData
   * @returns {{}}
   */
  payNotify(notifyData) {
    if (think.isEmpty(notifyData)) {
      return false;
    }

    const notifyObj = {};
    let sign = '';
    for (const key of Object.keys(notifyData)) {
      if (key !== 'sign') {
        notifyObj[key] = notifyData[key][0];
      } else {
        sign = notifyData[key][0];
      }
    }
    if (notifyObj.return_code !== 'SUCCESS' || notifyObj.result_code !== 'SUCCESS') {
      return false;
    }
    const signString = this.signQuery(this.buildQuery(notifyObj));
    if (think.isEmpty(sign) || signString !== sign) {
      return false;
    }
    return notifyObj;
  }
};
