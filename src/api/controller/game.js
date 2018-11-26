const Base = require('./base.js');
module.exports = class extends Base {
  async overAction() {
    const userObj = {
      user_id: this.getLoginUserId(),
      level: this.post('level'),
      title: this.post('title'),
      time: this.post('time')
    };
    const game = await this.model('game').getScore(5157);
    if (think.isEmpty(game)) {
      await this.model('game').add(userObj);
      this.success('ok');
    } else {
      userObj['insert_date'] = new Date();
      if (Number(game[0].level) < Number(userObj.level)) {
        await this.model('game').where({ 'id': game[0].id }).update(userObj);
      }
      if (Number(game[0].level) === Number(userObj.level) && Number(game[0].time) > Number(userObj.time)) {
        await this.model('game').where({ 'id': game[0].id }).update(userObj);
      }
      this.success('update');
    }
  }
  async listAction() {
    const day = await this.model('game').dayRanking();
    const week = await this.model('game').weekRanking();
    const month = await this.model('game').monthRanking();
    this.json({ day: day, week: week, month: month });
  }
};
