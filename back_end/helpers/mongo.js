// https://cloud.mongodb.com/v2/5fccbfb79d765327bbd54d7a#clusters/detail/moviesonfreeview
// https://cloud.mongodb.com/v2/5fccbfb79d765327bbd54d7a#metrics/replicaSet/5fccc554aecebf0801244a09/explorer/heroku_7qhfvjll/moviesonfreeview_films/find

var log = require('./log');
var MongoClient = require('mongodb').MongoClient;

var uri = 'mongodb+srv://heroku_7qhfvjll:h4vpbbqsmmr6539psoasin5mkf@moviesonfreeview.ijyos.mongodb.net/heroku_7qhfvjll?retryWrites=false&w=majority'
var collectionName = 'moviesonfreeview_films';
var client = new MongoClient(uri);
var collection;

client.connect(function(err) {
	if (err) {
		log(err);
	} else {
		collection = client.db('heroku_7qhfvjll').collection(collectionName);
	}
});

// client.close();

function waitForCollection(callback){
    if(typeof collection !== 'undefined'){
        callback();
    } else {
        setTimeout(waitForCollection, 250);
    }
}

module.exports = {
	insert: function(obj, callback) {
		waitForCollection(function() {
			collection.insertOne(obj, function (err, result) {
				if (err) {
					log(err);
				} else {
					log('Inserted object into collection');
				}
	
				callback();
			});
		}.bind(this));
	},

	find: function(query, callback) {
		waitForCollection(function() {
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
		}.bind(this));
	},

	count: function(query, callback) {
		waitForCollection(function() {
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
		}.bind(this));
	},

	update: function(query, replacement) {
		waitForCollection(function() {
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
		}.bind(this));
	},

	remove: function(query, callback) {
		waitForCollection(function() {
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
		}.bind(this));
	},

	// These two functions are slightly hacky and just use Mongo as a big file
	get: function(callback) {
		waitForCollection(function() {
			this.find({}, function(data) {
				data = data[0];
				delete data['_id'];
				console.log(data);
				callback(data);
			});
		}.bind(this));
	},

	set: function(data, callback) {
		var self = this;

		waitForCollection(function() {
			this.remove({}, function() {
				self.insert(data, callback);
			});
		}.bind(this));
	}
};