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
    'user/checkName',
    'user/forgetPassword',
    'user/register',
    'user/getAvatar',
    'game/list',
    'bill/list',
    'bill/get',
    'bill/getDetailByBillId',
    'bill/getDetailByBillIdAndCategory',
    'group/list',
    'group/get',
    'ad/getNumber',
    'notice/get',
    'notice/check',
    'location/getChina',
    'location/getProvinces',
    'material/categoryAll',
    'material/category',
    'material/list',
    'material/get',
    'material/getImage',
    'material/getImageSmall',
    'material/randomList'
  ]
};
