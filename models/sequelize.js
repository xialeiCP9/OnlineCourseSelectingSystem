/**
 * 数据库
 */
var config = {
	db: 'courseSelecting',
	un: 'root',
	pw: '123456',
	host: 'localhost'
}
var Sequelize = require("sequelize");

var sequelize = new Sequelize(config.db,config.un,config.pw,{
	host: config.host,
	dialect: 'mysql',
	timstamps: false
})

module.exports = sequelize;

