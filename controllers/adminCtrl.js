var formidable = require("formidable");
var xlsx = require("node-xlsx");
var url = require("url");
var fs = require("fs");
var dateFormat = require("date-format");
var Student = require("../models/Student.js");

exports.showAdminDashBoard = function(req,res){
	res.render("admin/index");
}
exports.showAdminWelcome = function(req,res){
	res.render("admin/welcome");
}
//错误页面
exports.showAdminError = function(req,res){
	res.render("admin/error");
}

exports.showAdminCourse = function(req,res){
	res.render("admin/course");
}
exports.showAdminStudent = function(req,res){
	res.render("admin/student");
}
exports.showAdminStudentImport = function(req,res){
	res.render("admin/student/student-import");
}

exports.doAdminStudentImport = function(req,res){
	var form = new formidable.IncomingForm();
	form.uploadDir = "./uploads/";
	form.keepExtensions = true;

	form.parse(req,function(err,fields,files){
		var workSheetsFromFile = xlsx.parse("./" + files.file.path);
		//检查表格是否正确
		var len = workSheetsFromFile.length;
		for(var i = 0 ; i < len ; i++){

			if(workSheetsFromFile[i].data[0][0] != "学号" ||
				workSheetsFromFile[i].data[0][1] != "姓名" ||
				workSheetsFromFile[i].data[0][2] != "性别" ){
				res.json({
					status: 2 , 
					msg: "Excel表格第" + i + "号子表的子表头不正确"
				});
				return;
			}

		}
		//加入数据库
		Student.importStudent(workSheetsFromFile);
		res.json({
			status: 1 
		});
	})
}

//根据查询条件获取学生列表
exports.getAllStudent = function(req,res){
	var page = parseInt(url.parse(req.url,true).query.page);
	var limit = parseInt(url.parse(req.url,true).query.limit);
	//查询条件
	var sname = url.parse(req.url,true).query.sname;
	var sid = url.parse(req.url,true).query.sid;
	var grade = url.parse(req.url,true).query.grade;
	var findFilter = {};
	if(sname != "" && sname != undefined){
		findFilter["sname"] = new RegExp(sname,"g");
	}
	if(sid != "" && sid != undefined){
		findFilter["sid"] = new RegExp(sid,"g");
	}
	if(grade != "" && grade != undefined){
		findFilter["grade"] = parseInt(grade);
	}
	Student.count(findFilter,function(err,count){
		Student.find(findFilter).sort({"sid": 1}).limit(limit).skip(limit * (page - 1)).exec(function(err,result){
			res.json({
				"code": 0,
				"msg": "",
				"count": count,
				"data": result
			})
		})
	})
}

//更新学生
exports.updateStudent = function(req,res){
	var sid = req.params.sid;
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		if(err){
			console.log(err);
			res.json({
				status: -2,
				msg: "服务器错误,请练习管理员"
			});
			return;
		}
		var key = fields.key , value = fields.value;
		Student.find({"sid" : sid} , function(err,results){
			if(results.length == 0){
				res.json({
					status: -1,
					msg: "查无此人"
				});
				return;
			}
			var student = results[0];
			student[key] = value;
			student.save(function(err){
				if(err){
					console.log(err);
					res.json({
						status: -2,
						msg: "服务器错误,请练习管理员"
					});
					return;
				}
				res.json({
					status: 1,
					msg: "保存成功"
				});
			});
		})
	})
}

//增加学生
exports.showAdminAddStudent = function(req,res){
	res.render("admin/student/student-add");
}
exports.addStudent = function(req,res){
	var form  = new formidable.IncomingForm();
	form.parse(req,function(err,fields){

		if(err){
			console.log(err);
			res.json({
				status: -1,
				msg: "服务器错误"
			});
			return;
		}

		var sid = fields.sid,
			sname = fields.sname,
			password = fields.password,
			gender = parseInt(fields.gender),
			grade = parseInt(fields.grade);
		//后台验证数据
		if(!(/^1([0-9]){8}$/.test(value))){
		    res.json({
		    	status: -2,
		    	msg: "学号首位不能为0,且必须为9位数字"
		    });
		    return;
		}
		if(password == "" || password == undefined || !(/(.+){6,12}$/.test(password))){
			res.json({
				status: -4,
				msg: "必须填写密码,且位数为6-12位"
			});
			return;
		}
		if(sname == "" || sname == undefined){
			res.json({
				status: -5,
				msg: "姓名不能为空"
			});
			return;
		}
		Student.count({"sid": sid},function(err,count){
			if(err){
				res.json({"status" : -1 , msg: "服务器错误"});
				return;
			}
			if(count >= 1){
				res.json({"status" : -3 , msg: "学号在数据库中已存在"});
				return;
			}
			var s = new Student({
				sid: sid,
				sname: sname,
				password: password,
				gender: gender,
				grade: grade,
				isInitialPassword: true
			})
			s.save(function(err){
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
					msg: "添加学生: 学号--" + sid + " , 姓名--" + sname + " 成功" 
				});
			});
		});
	})
}

//检查学生是否存在
exports.checkStudentExit = function(req,res){
	var sid = req.params.sid;

	Student.count({"sid": sid},function(err,count){
		if(err){
			res.json({"status" : -1});
			return;
		}
		res.json({"status" : count});
	});
}

//删除学生
exports.delStudent = function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		if(fields.data.length == 0){
			res.json({"status" : -1,"msg": "没有数据要删除"});
			return;
		}
		Student.deleteMany({"sid" : fields.data},function(err,obj){
			if(err){
				res.json({"status" : -1,"msg": "服务器错误"});
				return;
			}
			res.json({"status" : obj.ok , "msg" : "成功删除" + obj.deletedCount + "条数据"});
		})
	})
}

//下载学生Excel表
exports.downloadStudentXlsx = function(req,res){
	var data = [];
	var grades = ["初一","初二","初三","高一","高二","高三"];

	//迭代器,强制同步按顺序写入数组
	function iterator(i){
		if(i >= 6){
			var buffer = xlsx.build(data);
			var filename = "学生清单-" + dateFormat("yyyy年MM月dd日hhmmss",new Date()) + ".xlsx";
			//生成Excel文件
			fs.writeFile("./public/xlsx/" + filename,buffer,function(err){
				if(err){
					console.log(err);
					res.json({
						status : -1,
						msg: "服务器错误"
					})
				}
				//重定向,让用户的路由直接调到文件路径中
				res.json({
					status : 1,
					url: "/xlsx/" + filename,
					msg: "生成成功"
				})
			});
			return;
		}
		Student.find({"grade" : i + 1},function(err,result){
			var arr = [];
			result.forEach(function(item){
				arr.push([
					item.sid,
					item.sname,
					grades[item.grade - 1],
					item.password
				]);
			});
			data.push({"name" : grades[i] , data : arr});
			iterator(++i);
		})
	}
	iterator(0);

}