var format = require('util').format;
var debugPrint = require('./util').debugPrint;

var Schema = function (s) {
	if (Schema.prototype._singletonInstance) {
		debugPrint('Schema constructor called multiple times', 'warning');
		return Schema.prototype._singletonInstance;
	}
	Schema.prototype._singletonInstance = this;

	var schema = s;
	debugPrint(format('Schema is built: %j', s));
	this.getSchema = function () {
		return schema;
	};
	this.setSchema = function (s) { // todo: actually build the object
		schema = s;
	};
};

module.exports = Schema;
