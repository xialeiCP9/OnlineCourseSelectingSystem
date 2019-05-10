var formidable = require("formidable");
var model = require("../models/model.js");
var Student = require("../models/Student.js");
//分页大小
var limit = 5;

exports.showAdminIndex = function(req,res){
	res.render("admin/index");
}
exports.showAdminWelcome = function(req,res){
	res.render("admin/welcome");
}
exports.showAdminStudents = function(req,res){
	//获取页数
	var page = req.params.page;
	Student.getPage(function(count){
		//查找所有的学生
		Student.findAll({offset: (page - 1) * limit  , limit: limit})
			.then(result => {
				res.render("admin/studentList" , {
					students: result,
					count: count,
					curr: page
				});
			});
	});
}
exports.showAdminCourses = function(req,res){
	res.render("admin/courseList");
}
exports.showAdminStudent = function(req,res){
	res.render("admin/student-add");
}
exports.showAdminCourse = function(req,res){
	res.render("admin/course-add");
}
exports.doAdminUpload = function(req,res){
	var form = new formidable.IncomingForm();
	form.uploadDir = "./upload";
	form.keepExtensions = true;
	form.parse(req,function(err,fields,files){
		if(err){
			console.log(err);
			res.json({
				result: "服务器错误"
			});
		}
		var result = model.readExcel("./" + files.file.path);
		//整理数据并存入数据库
		var records = [];
		for(var i = 0 ; i < result.length ; i++){
			console.log("数量：" + result[i]["data"].length)
			for(var j = 1 ; j < result[i]["data"].length ; j++){
				var record = {};
				record.sid = result[i]["data"][j][0];
				record.sname = result[i]["data"][j][1];
				record.sex = result[i]["data"][j][2] == "男" ? 0 : 1;
				record.admissionDate = new Date(1900,0,result[i]["data"][j][3]);
				record.password = result[i]["data"][j][4];
				record.clazz = result[i]["name"];
				records.push(record);
			}
		}

		Student.bulkCreate(records).then(ok => {
			console.log("OK");
			res.json({
				result: "上传成功"
			});
		}).catch(e => {
			console.log(e);
			res.json({
				result: "出错"
			});
		});
		
	})
}
exports.addAdminStudent = function(req,res){
	console.log("增加学生");
	var form  = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		console.log(fields);
		Student.create(fields)
			.then(ok => res.json({status: 'ok'}))
			.catch(e => res.json({status: 'error',message: e}));
	});
}
exports.delAdminStudent = function(req,res){
	console.log("删除学生");
	var sid = req.params.sid;
	Student.destroy({
		'where' : {'sid' : sid}
	}).then(ok => res.json({status: 'ok'}))
	  .catch(e => res.json({status: 'error',message: e}));
}
exports.getAdminStudent = function(req,res){
	console.log("查找学生");
	var RUrl = req.params.sid;
	console.log(RUrl + " 正在查找");
	res.json({
		result: false
	})
}