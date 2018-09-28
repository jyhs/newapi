// default config
module.exports = {
  // 可以公开访问的Controller
  publicController: [
    'tools'
  ],

  // 可以公开访问的Action
  publicAction: [
    'user/loginByCode',
    'user/loginByPassword',
    'user/getById',
    'user/forgetPassword',
    'user/register'
  ]
};
