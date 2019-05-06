var xlsx = require("node-xlsx");

exports.readExcel = function(filename){
	return xlsx.parse(filename);
}