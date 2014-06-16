var colors = require('colors');
var format = require('util').format;
var Table = require('cli-table');

var GLOBALS = {};
GLOBALS.debugMode = true;
GLOBALS.theme = {
  verbose: 'blue',
  data: 'grey',
  info: 'green',
  op: 'cyan',
  warn: 'yellow',
  error: 'red',
  unknown: 'white'
};
GLOBALS.table = new Table({
  chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': '',
           'bottom': '' , 'bottom-mid': '' ,
           'bottom-left': '' , 'bottom-right': '',
           'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': '',
           'right': '' , 'right-mid': '' , 'middle': ' ' },
  style: { 'padding-left': 0, 'padding-right': 0 }
});

colors.setTheme(GLOBALS.theme);

var debugPrint = function (type, msg, scope) {
  if (GLOBALS.debugMode) {
  	if (!(type && typeof type === 'string' &&
  		   (type = type.trim().toLowerCase()) in GLOBALS.theme)) {
  		type = 'unknown';
  	}
  	console.log(format('%s: %s', type.toUpperCase(), msg)[type]);
  }
};

function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time);
    if (callback && typeof callback === 'function') callback();
}

module.exports.sleep = sleep;
module.exports.debugPrint = debugPrint;
