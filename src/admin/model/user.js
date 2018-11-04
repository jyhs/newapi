
module.exports = class extends think.Model {
  userListByProvince(limit = 29) {
    return this.query(`select (select name from provinces where code=u.province) province,count(1) count from user u group by u.province order by count desc limit ${limit}`);
  }
  userCityListByProvince(province) {
    return this.query(`select (select name from citys where mark=u.city) city,count(1) count from user u where province='${province}' group by u.city order by count desc`);
  }
};
