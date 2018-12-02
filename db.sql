
create database jyhs;
use jyhs;
create table user(
    id int not null auto_increment,
    name varchar(20) not null,
    password varchar(200) not null,
    city varchar(50) not null,
    phone varchar(20) not null,
    type varchar(20) not null default 'consumer',
    status int not null default 0,
    primary key(id)
);
alter table user add column point int not null default 0;
alter table user add column address varchar(200);
alter table user add column description varchar(2000);
alter table user add column province varchar(20);
alter table user add column pay_type varchar(20);
alter table user add column contacts varchar(20);
alter table user add column code varchar(20);
alter table user add column nickname varchar(100);
alter table user add column sex int;
alter table user add column province_name varchar(100);
alter table user add column city_name varchar(100);
alter table user add column country varchar(100);
alter table user add column headimgurl varchar(2000);
alter table user add column privilege varchar(2000);
alter table user add column openid varchar(1000);
alter table user add column unionid varchar(1000);
alter table user add column insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
alter table user modify column city varchar(50) null;
alter table user modify column type varchar(20) DEFAULT 'yy';
alter table user add column tag varchar(20);


create table material(
    id int not null auto_increment,
    category varchar(20) not null,
    name varchar(20) not null,
    type varchar(20) not null,
    ename varchar(50),
    sname varchar(50),
    tag varchar(100),
    code varchar(50) not null,
    level varchar(50) not null,
    price int not null,
    description varchar(4000),
    compatibility  varchar(20) not null,
    img_number int,
    primary key(id)
);
alter table material change `name` `name` varchar(100) character set utf8 not null ;
alter table material change `tag` `tag` varchar(500) character set utf8 not null ;
alter table material add column classification int;


alter table material character set utf8;

create table bill_detail(
    id int not null auto_increment,
    bill_id int not null,
    name varchar(200) not null,
    size varchar(20),
    price int not null,
    point int,
    material_id int,
    primary key(id)
);
alter table bill_detail change `name` `name` varchar(200) character set utf8 not null ;
alter table bill_detail change `size` `size` varchar(20) character set utf8 not null ;
alter table bill_detail add column numbers int;
alter table bill_detail add column limits int;
alter table bill_detail add column recommend varchar(20);


alter table bill_detail character set utf8;

create table bill(
    id int not null auto_increment,
    name varchar(100) not null,
    contacts varchar(20) not null,
    phone varchar(20) not null,
    description varchar(4000),
    upload_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id int not null,
    primary key(id)
);
alter table bill change `name` `name` varchar(100) character set utf8 not null ;
alter table bill change `contacts` `contacts` varchar(20) character set utf8 not null ;
alter table bill change `description` `description` varchar(4000) character set utf8 not null ;
alter table bill add column effort_date TIMESTAMP;
alter table bill add column supplier_id int not null;
alter table bill add column is_one_step int  default 0;



create table group_bill(
    id int not null auto_increment,
    name varchar(100) not null,
    contacts varchar(100) not null,
    phone varchar(20) not null,
    end_date  TIMESTAMP  not null,
    pickup_address varchar(200) not null,
    pay_type varchar(10) not null,
    pay_count varchar(50) not null,
    pay_name varchar(50) not null,
    freight double(3,2) not null,
    pay_description varchar(500),
    description varchar(4000) not null,
    isflash  int,
    flash_desc varchar(500),
    bill_id int not null,
    user_id int not null,
    primary key(id)
);
alter table group_bill add column pickup_date timestamp default now();
alter table group_bill add column status int not null DEFAULT 1;
alter table group_bill add column city varchar(10);
alter table group_bill add column province varchar(20);
alter table group_bill add column current_step int not null DEFAULT 0;
alter table group_bill add column top_freight int  DEFAULT 0;
alter table group_bill add column activity_code varchar(10);



alter table group_bill change `name` `name` varchar(100) character set utf8 not null ;
alter table group_bill change `contacts` `contacts` varchar(100) character set utf8 not null ;
alter table group_bill change `pickup_address` `pickup_address` varchar(200) character set utf8 not null ;
alter table group_bill change `pay_name` `pay_name` varchar(50) character set utf8 not null ;
alter table group_bill change `pay_description` `pay_description` varchar(500) character set utf8 not null ;
alter table group_bill change `description` `description` varchar(4000) character set utf8 not null ;
alter table group_bill change `flash_desc` `flash_desc` varchar(500) character set utf8 not null ;
alter table group_bill character set utf8;
alter table group_bill change `contacts` `contacts` varchar(100) character set utf8mb4 not null ;


alter table group_bill change `pickup_address` `pickup_address` varchar(200) character set utf8 ;
alter table group_bill change `pay_type` `pay_type` varchar(10) character set utf8 ;
alter table group_bill change `pay_count` `pay_count` varchar(50) character set utf8 ;
alter table group_bill change `pay_name` `pay_name` varchar(50) character set utf8 ;
alter table group_bill change `pay_description` `pay_description` varchar(500) character set utf8 ;
alter table group_bill change `flash_desc` `flash_desc` varchar(500) character set utf8 ;
alter table group_bill change `pickup_date` `pickup_date` TIMESTAMP;
alter table group_bill change `freight` `freight` double(3,2);
alter table group_bill add column private int  default 0;


create table cart(
    id int not null auto_increment,
    group_bill_id int not null,
    insert_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id int not null,
    primary key(id)
);
alter table cart add column phone varchar(11);
alter table cart add column description varchar(2000);
alter table cart add column status int not null default 0;
alter table cart add column sum int not null default 0;
alter table cart add column is_confirm int default 0;
alter table cart add column is_pay int default 0;
alter table cart add column freight double(7,2) not null default 0.00;
alter table cart add column lost_back double(7,2)  default 0.00;
alter table cart add column damage_back double(7,2)  default 0.00;
alter table cart add column nonceStr varchar(100);


alter table cart change `phone` `phone` varchar(11) character set utf8 not null ;
alter table cart change `description` `description` varchar(2000) character set utf8;



create table cart_detail(
    id int not null auto_increment,
    cart_id int not null,
    bill_detail_id int not null,
    bill_detail_num int not null DEFAULT 1,
    primary key(id)
);
alter table cart_detail add column is_lost int default 0;
alter table cart_detail add column is_damage int default 0;

alter table cart_detail add column org_bill_detail_num int default 0;
alter table cart_detail add column lost_num int default 0;
alter table cart_detail add column damage_num int default 0;
alter table cart_detail add column lost_back_freight int default 0;
alter table cart_detail add column freight double(7,2) not null default 0.00;

create table citys(
 mark varchar(15) not null,
 name varchar(60) not null,
 area varchar(30) not null,
 fristLetter varchar(5),
 sort int(11),
 qq   varchar(100),
 type int(11),
 primary key(mark)
);


create table focus(
    id int not null auto_increment,
    user_id int not null,
    material_id int not null,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    primary key(id)
);


alter table focus add column notice_id int;

create table black_list(
    id int not null auto_increment,
    name varchar(100) not null,
    type int not null,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    primary key(id)
);
INSERT INTO black_list (name,type) VALUE('海龟',1);
INSERT INTO black_list (name,type) VALUE('玳瑁',1);
INSERT INTO black_list (name,type) VALUE('鹦鹉螺',1);
INSERT INTO black_list (name,type) VALUE('硨磲',1);


insert into citys (mark,name,area,fristLetter,sort,type) values('jj','九江','jx','J',2,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('jdz','景德镇','jx','J',3,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('px','萍乡','jx','P',4,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('xy','新余','jx','X',5,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('yt','鹰潭','jx','Y',6,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('sr','上饶','jx','S',9,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('ja','吉安','jx','J',10,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('fuz','抚州','jx','F',11,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('ganzhou','赣州','jx','G',7,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('yichun','宜春','jx','Y',8,2);

create table game(
    id int not null auto_increment,
    user_id int not null,
    level int,
    title varchar(100),
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time int,
    primary key(id)
);


create table share(
    id int not null auto_increment,
    user_id int not null,
    param varchar(500),
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    encryptedData varchar(2000),
    iv varchar(100),
    primary key(id)
);


CREATE TABLE `provinces` (
  `code` varchar(15) NOT NULL,
  `name` varchar(60) NOT NULL,
  PRIMARY KEY (`code`)
);

INSERT INTO `provinces` VALUES ('ah', '安徽');
INSERT INTO `provinces` VALUES ('bj', '北京');
INSERT INTO `provinces` VALUES ('cq', '重庆');
INSERT INTO `provinces` VALUES ('fj', '福建');
INSERT INTO `provinces` VALUES ('gd', '广东');
INSERT INTO `provinces` VALUES ('gs', '甘肃');
INSERT INTO `provinces` VALUES ('gx', '广西');
INSERT INTO `provinces` VALUES ('gz', '贵州');
INSERT INTO `provinces` VALUES ('hb', '湖北');
INSERT INTO `provinces` VALUES ('he', '河北');
INSERT INTO `provinces` VALUES ('hl', '黑龙江');
INSERT INTO `provinces` VALUES ('hn', '河南');
INSERT INTO `provinces` VALUES ('hu', '湖南');
INSERT INTO `provinces` VALUES ('jl', '吉林');
INSERT INTO `provinces` VALUES ('js', '江苏');
INSERT INTO `provinces` VALUES ('jx', '江西');
INSERT INTO `provinces` VALUES ('ln', '辽宁');
INSERT INTO `provinces` VALUES ('nm', '内蒙古');
INSERT INTO `provinces` VALUES ('nx', '宁夏');
INSERT INTO `provinces` VALUES ('qh', '青海');
INSERT INTO `provinces` VALUES ('sa', '陕西');
INSERT INTO `provinces` VALUES ('sc', '四川');
INSERT INTO `provinces` VALUES ('sd', '山东');
INSERT INTO `provinces` VALUES ('sh', '上海');
INSERT INTO `provinces` VALUES ('sx', '山西');
INSERT INTO `provinces` VALUES ('tj', '天津');
INSERT INTO `provinces` VALUES ('xj', '新疆');
INSERT INTO `provinces` VALUES ('xz', '西藏');
INSERT INTO `provinces` VALUES ('yn', '云南');
INSERT INTO `provinces` VALUES ('zj', '浙江');

update citys set name='上海' where mark='shc';
update citys set name='北京' where mark='bjc';
update citys set name='天津' where mark='tjc';
update citys set name='重庆' where mark='cqc';

create table pay(
    id int not null auto_increment,
    cart_id int not null,
    user_id int not null,
    appid varchar(100),
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attach varchar(100),
    bank_type varchar(100),
    cash_fee varchar(100),
    fee_type varchar(100),
    is_subscribe varchar(100),
    mch_id varchar(100),
    nonce_str varchar(100),
    openid varchar(100),
    out_trade_no varchar(100),
    result_code varchar(100),
    sign varchar(100),
    time_end varchar(100),
    total_fee varchar(100),
    trade_type varchar(100),
    transaction_id varchar(100),
    primary key(id)
);


