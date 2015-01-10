// DESCRIPTION: Starts the core app functionality

var webserver  = require('./back_end/webserver')(__dirname); // Start webserver for the front-end
var films      = require('./back_end/films')();     // Start the scheduled job for getting film data