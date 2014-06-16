var colors = require('colors');
var format = require('util').format;

var GLOBALS = {};
GLOBALS.debugMode = true;
GLOBALS.theme = {
  verbose: 'cyan',
  data: 'grey',
  info: 'green',
  op: 'blue',
  warn: 'yellow',
  error: 'red',
  unknown: 'white'
};

colors.setTheme(GLOBALS.theme);

var debugPrint = function (type, msg, options) {
  if (GLOBALS.debugMode) {
  	if (!(type && typeof type === 'string' &&
  		   (type = type.trim().toLowerCase()) in GLOBALS.theme)) {
  		type = 'unknown';
  	}
  	console.log(format('%s: %s', type.toUpperCase(), msg)[type]);
  }
};

module.exports.debugPrint = debugPrint;
