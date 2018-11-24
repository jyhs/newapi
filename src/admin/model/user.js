
module.exports = class extends think.Model {
  userListByProvince(limit = 29) {
    return this.query(`select (select name from provinces where code=u.province) province,count(1) count from user u group by u.province order by count desc limit ${limit}`);
  }
  userCityListByProvince(province) {
    return this.query(`select (select name from citys where mark=u.city) city,count(1) count from user u where province='${province}' group by u.city order by count desc`);
  }
  getUserLikeMaterial(userId) {
    return this.query(`select (select name from material where id=b.material_id) name, b.material_id,count(b.material_id) count from  cart c,cart_detail cd,bill_detail b where cd.cart_id=c.id and cd.bill_detail_id=b.id and c.user_id=${userId} and b.material_id >0  group by b.material_id order by count desc;`);
  }
};
