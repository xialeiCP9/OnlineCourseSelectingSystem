var express = require("express");

var mainCtrl = require("./controllers/mainControl.js");

var app = express();

//设置模板引擎
app.set("view engine","ejs");

//路由请单
app.get("/admin",mainCtrl.showAdminIndex);
app.get("/admin/welcome",mainCtrl.showAdminWelcome);
app.get("/admin/student",mainCtrl.showAdminStudentList);
app.post("/admin/upload",mainCtrl.doAdminUpload);

//静态文件
app.use(express.static("public"));
app.listen(3000);