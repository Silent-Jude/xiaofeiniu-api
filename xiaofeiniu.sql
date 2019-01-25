SET NAMES UTF8;
DROP DATABASE IF EXISTS xiaofeiniu;
CREATE DATABASE xiaofeiniu charset=UTF8;

USE xiaofeiniu;


#管理员信息表
CREATE TABLE xfn_admin(
  aid int primary key auto_increment,
  aname varchar(32) not null,
  apwd varchar(64) not null,                    # 需要md5加密
  role int not null                          # 0,1,2
);

#项目全局设置表。
CREATE TABLE xfn_settings(
  sid int primary key auto_increment,
  appName varchar(32),
  apiUrl varchar(64),
  adminUrl varchar(64),
  appUrl varchar(64),
  icp varchar(64),
  copyright varchar(128)
);

#桌台信息表
CREATE TABLE xfn_table(
  tid int primary key auto_increment,
  tname varchar(64),
  type varchar(16),
  status  int                            #1-空闲，2-预定，3-占用，0-其他
);

#桌台预定表
CREATE TABLE xfn_reservation(
  rid int primary key auto_increment,
  contactName varchar(64) ,
  phone varchar(16),
  contactTime bigint,
  dinnerTime bigint
);

#菜品分类表
CREATE TABLE xfn_category(
  cid int primary key auto_increment,
  cname varchar(32)
);


#菜品信息表
CREATE TABLE xfn_dish(
  did int primary key auto_increment,
  title varchar(32),
  imgUrl varchar(128),
  price decimal(6,2),
  detail varchar(128),
  categoryId int
)