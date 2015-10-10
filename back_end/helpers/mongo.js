var mongojs = require('mongojs');
var log     = require('./log');

var uri = 'mongodb://heroku_7qhfvjll:h4vpbbqsmmr6539psoasin5mkf@ds031661.mongolab.com:31661/heroku_7qhfvjll';
var collectionName = 'moviesonfreeview_films';
var db = mongojs(uri, [collectionName], {authMechanism: 'ScramSHA1'});
var collection = db.collection(collectionName);

module.exports = {
	insert: function(obj, callback) {
		collection.insert(obj, function (err, result) {
			if (err) {
				log(err);
			} else {
				log('Inserted object into collection');
			}

			callback();
		});
	},

	find: function(query, callback) {
		collection.find(query).toArray(function (err, result) {
			if (err) {
				log(err);
			} else if (result.length) {
				log('Found: ', result);
				callback(result);
			} else {
				log('No document(s) found with defined "find" criteria!');
				callback({});
			}
		});
	},

	count: function(query, callback) {
		collection.find(query).toArray(function (err, result) {
			if (err) {
				log(err);
			} else if (result.length) {
				log('Counted: ' + result).length;
				callback(result.length);
			} else {
				log('No document(s) found with defined "find" criteria!');
				callback(0);
			}
		});
	},

	update: function(query, replacement) {
		collection.update(query, {$set: replacement}, function (err, numUpdated) {
			if (err) {
				log(err);
			} else if (numUpdated) {
				log('Updated ' + numUpdated + ' objects in collection');
			} else {
				log('No document found with defined "find" criteria!');
			}

			callback();
		});
	},

	remove: function(query, callback) {
		collection.remove(query, function (err, numUpdated) {
			if (err) {
				log(err);
			} else if (numUpdated) {
				log('Removed ' + numUpdated + ' objects in collection');
			} else {
				log('No document found with defined "find" criteria!');
			}

			callback();
		});
	},

	// These two functions are slightly hacky and just use Mongo as a big file
	get: function(callback) {
		this.find({}, function(data) {
			data = data[0];
			delete data['_id'];

			callback(data);
		});
	},

	set: function(data, callback) {
		var self = this;

		this.remove({}, function() {
			self.insert(data, callback);
		});
	}
};