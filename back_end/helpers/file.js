var fs = require('fs');

module.exports = function(filename) {
	var fileControl = {
		reset: function() {
			fs.writeFile(filename, '', function (err, data) {
				if (err) throw err;
			});

			return this;
		},

		append: function(content) {
			fs.appendFile(filename, content, function (err, data) {
				if (err) throw err;
			});

			return this;
		},

		read: function(callback) {
			fs.readFile(filename, function (err, data) {
				if (err) throw err;
				callback(data);
			});
		}
	};

	return fileControl;
};