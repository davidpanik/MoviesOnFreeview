// https://github.com/louischatriot/nedb/

var nedb = require('nedb');
var db = new nedb({ filename: 'path/to/datafile', autoload: true });


module.exports = {
	insert: function(obj) {
		db.insert(obj);
	},

	find: function(query, callback) {
		db.find(query, function (err, docs) {
			callback(docs);
		});
	},

	count: function(query, callback) {
		db.count(query, function (err, count) {
		  	callback(count);
		});
	},

	update: function(query, replacement) {
		db.update(query, replacement, { multi: true });
	},

	remove: function(query) {
		db.remove(query, { multi: true });
	}
};