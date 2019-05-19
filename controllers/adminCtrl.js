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