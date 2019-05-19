var mongoose = require("mongoose");

//创建schema
var courseSchema = new mongoose.Schema({
	"cid"				: String,
	"cname"				: String,
	"dayofweek"			: String,
	"number"			: Number,
	"allow"				: [Number],
	"teacher"			: [String],
	"briefintro"		: String,
	"students"			: [String]
});


//创建模型
var Course = mongoose.model("course",courseSchema);

module.exports = Course;