var formidable = require("formidable");
var crypto = require("crypto");
var Student = require("../models/Student.js");
var Course = require("../models/Course.js");

exports.showLogin = function(req,res){
	res.render("login");
}
//执行登陆
exports.doLogin = function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		var sid = fields.sid , password = fields.password;
		Student.findOne({sid: sid},function(err,result){
			if(err){
				res.json({
					status: -1,
					msg: "服务器错误"
				})
				return;
			}
			if(result == null){
				res.json({
					status: -2,
					msg: "这个学号不存在"
				})
				return;
			}
			var isInitialPassword = result.isInitialPassword;
			//如果这个学号没有修改过默认密码,则直接进行比配
			if(isInitialPassword){
				if(password !== result.password){
					res.json({
						status: -3,
						msg: "用户名或密码错误"
					});
					return;
				} else {
					//写入session
					req.session.login = true;
					req.session.sid = sid;
					req.session.sname = result.sname;
					req.session.grade = result.grade;
					req.session.isInitialPassword = result.isInitialPassword;
					res.json({
						status: 1,
						msg: "登录成功"
					})
				}
			} else {
				var cpassword = crypto.createHash("sha256").update(password).digest("hex");
				if(cpassword !== result.password){
					res.json({
						status: -3,
						msg: "用户名或密码错误"
					});
					return;
				} else {
					//写入session
					req.session.login = true;
					req.session.sid = sid;
					req.session.sname = result.sname;
					req.session.grade = result.grade;
					req.session.isInitialPassword = result.isInitialPassword;
					res.json({
						status: 1,
						msg: "登录成功"
					})
				}
			}
		})
	})
}
//报名
exports.showTable = function(req,res){
	if(req.session.login != true){
		res.redirect("/login");
		return;
	}
	//检测课程表中,哪些是可以报名的
	var result = {};
	Course.find({allow: req.session.grade},function(err,courses){
		//已被占用的日期
		var applyWeek = [];
		courses.forEach(function(item){
			if(item.students.indexOf(req.session.sid) != -1){
				applyWeek.push(item.dayofweek);
			}
		});
		//再次遍历
		courses.forEach(function(item){
			//该学生已选择这么课,按钮显示为退报
			if(item.students.indexOf(req.session.sid) != -1){
				
				result[item.cid] = -1;
			} else if(applyWeek.indexOf(item.dayofweek) != -1){ 
				//如果这么课的日期和已报的日期冲突,则显示该日期已占用
				result[item.cid] = -2;
			} else if(item.number <= 0){
				//课程已满

				result[item.cid] = -3;

			} else {

				result[item.cid] = 1;

			}
		})
		res.render("index",{
			sid: req.session.sid,
			sname: req.session.sname,
			isInitialPassword: req.session.isInitialPassword,
			grade: req.session.grade,
			result: result,
			page: index
		})
	})
}

exports.doLogout = function(req,res){
	req.session.login = false;
	req.session.sid = "";
	res.redirect("/login");
}

//修改密码
exports.showChangepw = function(req,res){
	if(req.session.login != true){
		res.redirect("/login");
		return;
	}
	res.render("changepw",{
		"sid" : req.session.sid,
		"sname" : req.session.sname
	})
}

exports.doChangepw = function(req,res) {
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		console.log(fields.password);
		//修改密码
		Student.findOne({sid: req.session.sid},function(err,data){
			if(err){
				res.json({
					status: -1,
					msg: "服务器错误"
				});
				return;
			}
			if(data == null){
				res.json({
					status: -2,
					msg: "不存在该学号"
				});
				return;
			}
			var student = data;
			student.isInitialPassword = false;
			req.session.isInitialPassword = false;
			//加密密码
			student.password = crypto.createHash("sha256").update(fields.password).digest("hex");
			student.save(function(err){
				if(err){
					res.json({
						status: -1,
						msg: "服务器错误"
					});
					return;
				}
				res.json({
					status: 1,
					msg: "密码修改成功"
				});
			})
		})
	})
}

exports.applyCourse = function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		if(err){
			res.json({
				status: -1,
				msg: "服务器错误,请刷新后重试"
			});
			return;
		}
		var cid = fields.cid;
		console.log("cid:" , cid);
		Course.findOne({cid: cid},function(err,course){
			if(err){
				res.json({
					status: -1,
					msg: "服务器错误,请刷新后重试"
				});
				return;
			}
			if(course.number <= 0){
				res.json({
					status: -2,
					msg: "课程已满,请选择其它课程"
				});
				return;
			}
			course.number -= 1;
			course.students.push(req.session.sid);
			course.save(function(err){
				if(err){
					res.json({
						status: -1,
						msg: "服务器错误,请刷新后重试"
					});
					return;
				}
				res.json({
					status: 1,
					msg: "报名成功"
				});
				return;
			});
		})
	})
}

exports.cancelCourse = function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		if(err){
			res.json({
				status: -1,
				msg: "服务器错误,请刷新后重试"
			});
			return;
		}
		var cid = fields.cid;
		console.log("cid:" , cid);
		Course.findOne({cid: cid},function(err,course){
			if(err){
				res.json({
					status: -1,
					msg: "服务器错误,请刷新后重试"
				});
				return;
			}
			
			course.number += 1;
			course.students.splice(course.students.indexOf(req.session.sid),1);
			course.save(function(err){
				if(err){
					res.json({
						status: -1,
						msg: "服务器错误,请刷新后重试"
					});
					return;
				}
				res.json({
					status: 1,
					msg: "取消报名成功"
				});
				return;
			});
		})
	})
}

exports.showMyCourse = function(req,res){
	if(req.session.login != true){
		res.redirect("/login");
		return;
	}
	res.render("myCourse",{
		sid: req.session.sid,
		sname: req.session.sname,
		isInitialPassword: req.session.isInitialPassword,
		grade: req.session.grade,
		page: "myCourse"
	});
}