var express = require("express");
var mongoose = require("mongoose");
var adminCtrl = require("./controllers/adminCtrl.js");
var session = require("express-session");
var app = express();

//链接数据库
mongoose.connect("mongodb://localhost/OnlineCourseSelectingSystem");
//使用session
app.use(session({
	secret: 'xialei',
	cookie: {maxAge: 60000 },
	resave: false,
	saveUninitialized: true
}));

//设置模板引擎
app.set("view engine","ejs");

//路由请单
app.get("/admin",adminCtrl.showAdminDashBoard);
app.get("/admin/welcome",adminCtrl.showAdminWelcome);
app.get("/admin/course",adminCtrl.showAdminCourse);
app.get("/admin/student",adminCtrl.showAdminStudent);

//导入学生
app.get("/admin/student/import",adminCtrl.showAdminStudentImport);
app.post("/admin/student/import",adminCtrl.doAdminStudentImport);
//下载学生表格
app.get("/admin/student/download",adminCtrl.downloadStudentXlsx)

//获取所有学生
app.get("/student",adminCtrl.getAllStudent);
app.post("/student/:sid",adminCtrl.updateStudent);
app.propfind("/student/:sid",adminCtrl.checkStudentExit);

//增加学生
app.get("/admin/student/add",adminCtrl.showAdminAddStudent);
app.post("/student",adminCtrl.addStudent);
//删除学生
app.delete("/student",adminCtrl.delStudent);

/*app.get("/admin/students/:page",mainCtrl.showAdminStudents);
app.get("/admin/student",mainCtrl.showAdminStudent);
app.get("/admin/student/:sid",mainCtrl.getAdminStudent);
app.delete("/admin/student/:sid",mainCtrl.delAdminStudent);
app.get("/admin/courses",mainCtrl.showAdminCourses);
app.post("/admin/upload",mainCtrl.doAdminUpload);
app.post("/admin/student",mainCtrl.addAdminStudent);*/

//静态文件
app.use(express.static("public"));

app.use(adminCtrl.showAdminError);
app.listen(3000);