const Base = require('./base.js');
module.exports = class extends Base {
  async overAction() {
    const userObj = {
      user_id: this.getLoginUserId(),
      level: this.get('level'),
      title: this.get('title'),
      time: this.get('time')
    };
    const game = await this.model('game').where({ 'user_id': this.getLoginUserId() }).find();
    if (think.isEmpty(game)) {
      await this.model('game').add(userObj);
    } else {
      if (game.level < userObj.level) {
        await this.model('game').where({ 'user_id': this.getLoginUserId() }).update(userObj);
      }
      if (Number(game.level) === Number(userObj.level) && game.time > userObj.time) {
        await this.model('game').where({ 'user_id': this.getLoginUserId() }).update(userObj);
      }
    }
  }
  async listAction() {
    const model = this.model('game').alias('g');
    model.field(['g.*', 'u.name', 'u.headimgurl']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['g.user_id', 'u.id']
    });
    const list = await model.order(['g.level desc', 'g.time asc']).limit(50).select();
    this.json(list);
  }
};
