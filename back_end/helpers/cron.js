var cron = require('cron').CronJob;
var log  = require('./log');

module.exports = function(interval, callback, immediate) {
	var job = new cron(interval, function() {
	    log('Running scheduled job');
	    callback();
	});
	job.start();

	if (immediate) {
		log('Forcing an update now');
	    callback();
	}
};