var sequelize = require("./sequelize.js");
var Sequelize = require("sequelize");

var Student = sequelize.define("student",{
	sid: {field: 'sid',type: Sequelize.STRING(50),allowNull: false,primaryKey: true},
	sname: {field: 'sname',type: Sequelize.STRING(50)},
	password: {field: 'password',type: Sequelize.STRING(50)},
	sex: {field: 'sex',type: Sequelize.INTEGER},
	admissionDate: {field: 'admissionDate',type: Sequelize.DATE},
	clazz: {field: 'clazz',type: Sequelize.STRING(20)},
},{timestamps: false});

//获取页数
Student.getPage = function(callback){
	Student.findAll({
		attributes:[[sequelize.fn(('COUNT'),sequelize.col('sid')),'count']]
	}).then(result => {
		callback && callback(result[0].dataValues.count);
	})
}

module.exports = Student;
//增加学生
