module.exports = class extends think.Controller {
  async __before() {
    // 根据token值获取用户id
    this.ctx.state.token = this.ctx.header['authorization'] || '';
    const tokenSerivce = think.service('token', 'api');
    this.ctx.state.user = await tokenSerivce.getUser(this.ctx.state.token);
    const publicController = this.config('publicController');
    const publicAction = this.config('publicAction');
    // 如果为非公开，则验证用户是否登录
    const controllerAction = this.ctx.controller + '/' + this.ctx.action;
    if (!publicController.includes(this.ctx.controller) && !publicAction.includes(controllerAction)) {
      if (!this.ctx.state.user || this.ctx.state.user.id <= 0) {
        return this.fail(401, '请先登录');
      }
      const userId = this.get('user_id') || this.post('user_id');
      if (userId && userId !== this.ctx.state.user.id) {
        return this.fail(401, '无权访问');
      }
      if (this.ctx.state.user.type === 'yy') {
        return this.fail(401, '无权访问');
      }
      if (this.ctx.controller === 'user' && !(this.ctx.state.user.type === 'admin' || this.ctx.state.user.type === 'yhgly')) {
        return this.fail(401, '无权访问');
      }
      if (this.ctx.controller === 'group' && !(this.ctx.state.user.type === 'admin' || this.ctx.state.user.type === 'tggly')) {
        return this.fail(401, '无权访问');
      }
      if (this.ctx.controller === 'detail' && !(this.ctx.state.user.type === 'admin' || this.ctx.state.user.type === 'tggly')) {
        // return this.fail(401, '无权访问');
      }
      if (this.ctx.controller === 'bill' && !(this.ctx.state.user.type === 'admin' || this.ctx.state.user.type === 'tggly')) {
        // return this.fail(401, '无权访问');
      }
      if (this.ctx.controller === 'material' && !(this.ctx.state.user.type === 'admin' || this.ctx.state.user.type === 'bkgly')) {
        // return this.fail(401, '无权访问');
      }
    }
  }

  /**
     * 获取时间戳
     * @returns {Number}
     */
  getTime() {
    return parseInt(Date.now() / 1000);
  }

  /**
     * 获取当前登录用户的id
     * @returns {*}
     */
  getLoginUserId() {
    return this.ctx.state.user.id;
  }

  getLoginUser() {
    return this.ctx.state.user;
  }
};
