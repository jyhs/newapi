const Base = require('./base.js');
module.exports = class extends Base {
  async overAction() {
    const userObj = {
      user_id: this.getLoginUserId(),
      level: this.post('level'),
      title: this.post('title'),
      time: this.post('time')
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
    const day = await this.model('game').dayRanking();
    const week = await this.model('game').weekRanking();
    const month = await this.model('game').monthRanking();
    this.json({ day: day, week: week, month: month });
  }
};
