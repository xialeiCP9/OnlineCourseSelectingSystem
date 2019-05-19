var formidable = require("formidable");
var fs = require("fs");
var url = require("url");

var Course = require("../models/Course.js");

exports.showAdminCourse = function(req,res){
	if(req.session.login != true){
		res.redirect("/login");
		return;
	}
	res.render("admin/course");
}
exports.showAdminCourseImport = function(req,res){
	if(req.session.login != true){
		res.redirect("/login");
		return;
	}
	res.render("admin/course/course-import");
}
//增加课程
exports.showAdminAddCourse = function(req,res){
	if(req.session.login != true){
		res.redirect("/login");
		return;
	}
	res.render("admin/course/course-add");
}

//导入课程
exports.doAdminCourseImport = function(req,res){
	var form = new formidable.IncomingForm();

	form.uploadDir = "./uploads/";
	form.keepExtensions = true;
	form.parse(req,function(err,fields,files){
		fs.readFile(files.file.path,function(err,data){
			var courses = JSON.parse(data.toString()).courses;
			if(!courses instanceof Array){
				res.json({
					status: 2,
					msg: "文件格式不符合要求"
				});
				return;
			}
			//删除集合中的数据
			Course.deleteMany({},function(err,data){
				Course.insertMany(courses,function(err,r){
					if(err){
						res.json({
							status: -1,
							msg: "服务器出错"
						})
						return;
					}

					res.json({
						status: 1,
						msg: "成功插入" + r.length + "条数据"
					})
				})
			})
		})
	})
}

//获取所有课程
exports.getAllCourse = function(req,res){
	if(req.session.login != true){
		res.redirect("/login");
		return;
	}
	var page = parseInt(url.parse(req.url,true).query.page);
	var limit = parseInt(url.parse(req.url,true).query.limit);
	//查询条件
	var cname = url.parse(req.url,true).query.cname;
	var teacher = url.parse(req.url,true).query.teacher;
	var grade = url.parse(req.url,true).query.grade;
	var sid = url.parse(req.url,true).query.sid;
	var findFilter = {};
	if(cname != "" && cname != undefined){
		findFilter["cname"] = new RegExp(cname,"g");
	}
	if(teacher != "" && teacher != undefined){
		findFilter["teacher"] = new RegExp(teacher,"g");
	}
	if(grade != "" && grade != undefined){
		findFilter["allow"] = parseInt(grade);
	}
	if(sid != "" && sid != undefined){
		findFilter["students"] = sid;
	}


	Course.count(findFilter,function(err,count){
		Course.find(findFilter).limit(limit).skip(limit * (page - 1)).exec(function(err,result){
			res.json({
				"code": 0,
				"msg": "",
				"count": count,
				"data": result
			})
		})
	})
}

//更新课程信息
exports.updateCourse = function(req,res){
	var cid = req.params.cid;

	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		if(err){
			console.log(err);
			res.json({
				status: -2,
				msg: "服务器错误,请联系管理员"
			});
			return;
		}
		//找到课程信息
		Course.findOne({cid : cid},function(err,data){
			if(data == null){
				res.json({
					status: -1,
					msg: "没有该课程"
				});
				return;
			}
			//根据字段进行更新
			var value ;
			switch(fields.key){
				case "allow":
					if(fields.value > 0){ //增加
						data.allow.push(fields.value);
						value = data.allow;
					} else {
						data.allow.splice(data.allow.indexOf(fields.value) , 1);
						value = data.allow;
					}
					console.log("value:" , value);
					break;
				case "teacher":
					value = fields.value.split(",");
					break;
				default:
					value = fields.value;
					break;
			}
			data[fields.key] = value;

			data.save(function(err){
				if(err){
					console.log(err);
					res.json({
						status: -2,
						msg: "服务器错误,请联系管理员"
					});
					return;
				}
				res.json({
					status: 1,
					msg: "保存成功"
				});
			});
		})
	});
}

//增加课程信息
exports.addCourse = function(req,res){
	var form = new formidable.IncomingForm();

	form.parse(req,function(err,fields){
		if(err){
			res.json({
				status: -1,
				msg: "服务器错误"
			})
			return;
		}
		var c = new Course({
			cid: fields.cid,
			cname: fields.cname,
			teacher: fields.teacher.split(";"),
			number: fields.number,
			allow: fields.allow.split(";"),
			briefintro: fields.briefintro,
			dayofweek: fields.dayofweek
		})
		c.save(function(err){
			if(err){
				console.log(err);
				res.json({
					status: -1,
					msg: "服务器错误"
				});
				return;
			}
			res.json({
				status: 1,
				msg: "添加课程: 编号--" + fields.cid + " , 名称--" + fields.cname + " 成功" 
			});
		});
	})
}

//删除课程
exports.delCourse = function(req,res){
	var form = new formidable.IncomingForm();

	form.parse(req,function(err,fields){
		if(fields.data.length == 0){
			res.json({"status" : -1,"msg": "没有数据要删除"});
			return;
		}
		Course.deleteMany({"cid" : fields.data},function(err,obj){
			if(err){
				res.json({"status" : -1,"msg": "服务器错误"});
				return;
			}
			res.json({"status" : obj.ok , "msg" : "成功删除" + obj.deletedCount + "条数据"});
		})
	})
}