// DESCRIPTION: Starts the core app functionality

var forceUpdate = (process.argv[2] === 'update');

var webserver  = require('./back_end/webserver')(__dirname); // Start webserver for the front-end
// var films      = require('./back_end/films')(forceUpdate);     // Start the scheduled job for getting film data