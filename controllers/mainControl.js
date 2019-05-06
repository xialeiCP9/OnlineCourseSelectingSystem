var formidable = require("formidable");
var model = require("../models/model.js");

exports.showAdminIndex = function(req,res){
	res.render("admin/index");
}
exports.showAdminWelcome = function(req,res){
	res.render("admin/welcome");
}
exports.showAdminStudentList = function(req,res){
	res.render("admin/studentList");
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
		console.log(files.File.path);
		res.json({
			result: "上传成功"
		});
	})
}