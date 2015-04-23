var fileName   = 'back_end/data/log.txt';
var verbose    = true;
var writeFile  = true;

var file       = require('./file')(fileName);
var moment     = require('moment');

module.exports = function(str) {
	if (str === 'reset') {
		if (writeFile) file.reset();
	} else {
		var date = moment().format('DD/MM/YY HH:mm:ss.SS');

		if (verbose) console.log(str);
		if (writeFile) file.append(date + ':   ' + str + '\n');
	}
};