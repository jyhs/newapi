// import fs from 'fs';
// import https from 'https';
// const options = {
//   key: fs.readFileSync('/usr/local/nginx/ssl/2_huanjiaohu.com.key'),
//   cert: fs.readFileSync('/usr/local/nginx/ssl/1_huanjiaohu.com_bundle.crt')
// };
module.exports = {
  workers: 0,
  image: {
    user: '/usr/local/nginx/html/image/user',
    ad: '/usr/local/nginx/html/image/ad',
    material: '/usr/local/nginx/html/image/material',
    notice: '/usr/local/nginx/html/image/notice',
    bill: '/usr/local/nginx/html/image/bill'
  }
};
