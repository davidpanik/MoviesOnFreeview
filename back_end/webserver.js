// DESCRIPTION: Launches a simple web-server for hosting the app's front-end

var express = require('express')();
var http    = require('http').Server(express);
var log     = require('./helpers/log');

var port = process.env.PORT || 5000;
var frontEndDir  = 'front_end';
var dataFile     = 'data/content.txt';
var logFile      = 'data/log.txt';

var channels = require('./config/channels');

module.exports = function(rootPath) {
	// Serve up the main data file
	express.get('/films.json', function(req, res){
		res.sendFile(__dirname + '/' + dataFile);
	});

	// Serve up log file
	express.get('/log.txt', function(req, res){
		res.sendFile(__dirname + '/' + logFile);
	});

	// Serve up channels info
	express.get('/channels.json', function(req, res){
		res.send(channels);
	});

	// Serve up everything else
	express.get(/^(.+)$/, function(req, res) {
		res.sendFile(rootPath + '/' + frontEndDir + '/' + req.params[0]);
	});

	http.listen(port, function() {
		log('Web server running on http://localhost:' + port);
	});
};