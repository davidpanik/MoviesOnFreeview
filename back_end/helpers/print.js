var prettyjson  = require('prettyjson');
var jsonOptions = {};

module.exports = function(jsonData) {
	console.log(prettyjson.render(jsonData, jsonOptions));
};