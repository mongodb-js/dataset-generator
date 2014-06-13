var colors = require('colors');

var GLOBALS = {};

GLOBALS.theme = {
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
  unknown: 'white'
};

colors.setTheme(GLOBALS.theme);

var debugPrint = function (msg, type, options) {
	if (!(type && typeof type === 'string' &&
		   (type = type.trim().toLowerCase()) in GLOBALS.theme)) {
		type = 'unknown';
	}
	console.log(msg[type]);
};

module.exports.debugPrint = debugPrint;
