var request = require('request');
var log     = require('./log');


var queue = []; // Stack up requests here
var throttleDelay = 500; // Delay in MS between requests
var maxRetries    = 5; // Number of times to reattempt a failed call


module.exports = function(url, data, callback) {
	if (!callback) {
		callback = data;
		data = {};
	}

	// Add this new request onto our queue
	queue.push({
		url:       url,
		data:      data,
		callback:  callback,
		retries:   maxRetries
	});

	if (queue.length === 1) nextItem();
};

// Process the next item in the queue
function nextItem() {
	// log('nextItem ' + queue.length);
	setTimeout(function() {
		if (queue.length > 0) {
			makeRequest(queue.shift());
		}
	}, throttleDelay);
}

// Actual requests calls made here
function makeRequest(item) {
	if (item.retries <= 0) {
		log('Ran out of attempts fetching ' + item.url);
		item.callback({ error: true });
		return false;
	}

	request(
		{
			url: item.url,
			qs:  item.data
		}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			body = JSON.parse(body);
			item.callback(body);
			nextItem();
		} else {
			log('ERROR fetching ' + item.url + '\n' + JSON.stringify(item.data) + '\nError: ' + error + '\n' + response + '\n' + 'Attempts left: ' + item.retries);
			item.retries--;
			queue.push(item);
			nextItem();
		}
	});
}