var express = require("express");
var mongoose = require("mongoose");
var mainCtrl = require("./controllers/mainCtrl.js");
var adminCtrl = require("./controllers/adminCtrl.js");
var adminStudentCtrl = require("./controllers/adminStudentCtrl.js");
var adminCourseCtrl = require("./controllers/adminCourseCtrl.js");
var session = require("express-session");
var app = express();

//链接数据库
mongoose.connect("mongodb://localhost/OnlineCourseSelectingSystem");
//使用session
app.use(session({
	secret: 'xialei',
	cookie: {maxAge: 60 * 24 * 60 * 1000 },
	resave: false,
	saveUninitialized: true
}));

//设置模板引擎
app.set("view engine","ejs");

//路由请单
app.get("/admin",adminCtrl.showAdminDashBoard);
app.get("/admin/welcome",adminCtrl.showAdminWelcome);
app.get("/admin/course",adminCourseCtrl.showAdminCourse);
app.get("/admin/student",adminStudentCtrl.showAdminStudent);

//导入学生
app.get("/admin/student/import",adminStudentCtrl.showAdminStudentImport);
app.post("/admin/student/import",adminStudentCtrl.doAdminStudentImport);
//下载学生表格
app.get("/admin/student/download",adminStudentCtrl.downloadStudentXlsx)

//获取所有学生
app.get("/student",adminStudentCtrl.getAllStudent);
app.post("/student/:sid",adminStudentCtrl.updateStudent);
app.propfind("/student/:sid",adminStudentCtrl.checkStudentExit);

//增加学生
app.get("/admin/student/add",adminStudentCtrl.showAdminAddStudent);
app.post("/student",adminStudentCtrl.addStudent);
//删除学生
app.delete("/student",adminStudentCtrl.delStudent);

/**
*	课程
*/
app.get("/admin/course/import",adminCourseCtrl.showAdminCourseImport);
app.get("/admin/course/add",adminCourseCtrl.showAdminAddCourse);
app.post("/admin/course/import",adminCourseCtrl.doAdminCourseImport);
app.get("/course",adminCourseCtrl.getAllCourse);
//更新课程信息
app.post("/course/:cid",adminCourseCtrl.updateCourse);
app.post("/course",adminCourseCtrl.addCourse);
//删除课程
app.delete("/course",adminCourseCtrl.delCourse);

//前台页面
app.get("/login",mainCtrl.showLogin);
app.post("/login",mainCtrl.doLogin);
app.get("/logout",mainCtrl.doLogout);
//报名界面
app.get("/",mainCtrl.showTable);
//修改密码
app.get("/changepw",mainCtrl.showChangepw);
app.post("/changepw",mainCtrl.doChangepw);
//报名
app.post("/apply",mainCtrl.applyCourse);
app.post("/cancel",mainCtrl.cancelCourse);

//我的选课表
app.get("/mycourse",mainCtrl.showMyCourse);

//静态文件
app.use(express.static("public"));

app.use(adminCtrl.showAdminError);
app.listen(3000);