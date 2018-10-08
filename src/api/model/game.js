module.exports = class extends think.Model {
  totleRanking() {
    const totle = 'select level,title,time,u.name,u.headimgurl from game g,user u where g.user_id=u.id  order by level desc,time asc limit 50';
    return this.execute(totle);
  }
  weekRanking() {
    const week = 'select level,title,time,u.name,u.headimgurl from game g,user u where g.user_id=u.id and YEARWEEK(date_format(g.insert_date,\'%Y-%m-%d\') - INTERVAL 1 DAY) = YEARWEEK(now() - INTERVAL 1 DAY)  order by level desc,time asc limit 50';
    return this.execute(week);
  }
  monthRanking() {
    const month = 'select level,title,time,u.name,u.headimgurl from game g,user u where g.user_id=u.id and DATE_FORMAT( g.insert_date, \'%Y%m\' ) = DATE_FORMAT( CURDATE( ) ,\'%Y%m\' )  order by level desc,time asc limit 50';
    return this.execute(month);
  }
};
