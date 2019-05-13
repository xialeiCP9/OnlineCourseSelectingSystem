var mongoose = require("mongoose");

//创建schema
var studentSchema = new mongoose.Schema({
	"sid"				: String,
	"sname"				: String,
	"gender"			: Number,
	"grade"				: Number,
	"password"			: String,
	"isInitialPassword"	: Boolean
});

studentSchema.statics.importStudent = function(workSheetsFromFile){
	var str = "ABDEFGHJKLMNPQRTXYZabdefghjkmnpqrtuwyz123456789#$&_!";
	//先将原集合删除
	mongoose.connection.collection("students").drop(function(err){
		if(err){
			console.error(err);
			return;
		}
		var len = workSheetsFromFile.length;
		for(var i = 0 ; i < len ; i++){
			for(var j = 1 ; j < workSheetsFromFile[i].data.length ; j++){
				//生成6位密码;
				var password = "";
				for(var m = 0 ; m < 6 ; m ++){
					password += str.charAt(parseInt(str.length * Math.random()));
				}
				var s = new Student({
					"sid" : workSheetsFromFile[i].data[j][0],
					"sname" : workSheetsFromFile[i].data[j][1],
					"gender" : workSheetsFromFile[i].data[j][2] == "男" ? 0 : 1,
					"grade" : i + 1 ,
					"password" : password,
					"isInitialPassword"	: true
				})
				s.save();
			}
		}
	})
}

//创建模型
var Student = mongoose.model("student",studentSchema);

module.exports = Student;