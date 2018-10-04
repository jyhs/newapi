module.exports = class extends think.Model {
  delete(id) {
    const deleteDetail = `delete from cart_detail where cart_id in (select id from (select c.id from cart c where c.group_bill_id=${id}) cartid)`;
    this.execute(deleteDetail);
  }
  summaryGroup(id) {
    const summaryGroup = `select bd.name,bd.size,bd.price,sum(bill_detail_num) bill_detail_num,sum((bd.price*cd.bill_detail_num)) sum,sum(c.freight) sum_freight,sum(c.lost_back) sum_lost_back,sum(c.damage_back) sum_damage_back from cart c,cart_detail cd,bill_detail bd where c.is_confirm=1 and c.id=cd.cart_id  and cd.bill_detail_id=bd.id and c.group_bill_id=${id} group by name,size,price`;
    return this.execute(summaryGroup);
  }
  detailGroup(id) {
    const detailGroup = `select IFNULL(u.nickname,u.name) userName,u.phone,u.contacts,(select name from citys where mark=u.province) province,(select name from citys where mark=u.city) city,if(u.address='null','',u.address) address,if(c.description='null','',c.description) description,bd.name,bd.size,bd.price,cd.bill_detail_num,(bd.price*cd.bill_detail_num) sum,c.freight,cd.lost_back_freight,cd.lost_num,cd.damage_num from cart c,cart_detail cd,bill_detail bd,user u where c.is_confirm=1 and c.id=cd.cart_id and c.user_id=u.id and cd.bill_detail_id=bd.id and c.group_bill_id=${id} order by c.id asc`;
    return this.execute(detailGroup);
  }
};
