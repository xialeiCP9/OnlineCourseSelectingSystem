/**
 * sql 语句
 */
Create Table students(
	sid varchar(50) NOT NULL,
	sname varchar(50) DEFAULT NULL,
	password varchar(50) DEFAULT NULL,
	sex int(1) DEFAULT 0,
	admissionDate Date DEFAULT NULL,
	clazz varchar(20) DEFAULT '初一',
	PRIMARY KEY (sid)
);