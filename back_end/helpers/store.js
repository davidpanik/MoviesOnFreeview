var fileName   = 'back_end/data/content.txt';

var file       = require('./file')(fileName);
// var database   = require('./database');


module.exports = {
	get: function(callback) {
		file.read(function(data) {
			data = JSON.parse(data);
			callback(data);
		});
	},

	set: function(data) {
		file
		.reset()
		.append(JSON.stringify(data, null, 4));
	}
};