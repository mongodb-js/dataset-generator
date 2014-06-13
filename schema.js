var format = require('util').format;
var debugPrint = require('./util').debugPrint;

var Schema = function () {
	if (Schema.prototype._singletonInstance) {
		debugPrint('Schema constructor called multiple times', 'warning');
		return Schema.prototype._singletonInstance;
	}
	Schema.prototype._singletonInstance = this;

	var schema = {};
	this.getSchema = function () {
		return schema;
	};
	this.buildSchema = function (s) { // todo: actually build the object
		schema = s;
		debugPrint(format('Schema is built: %j', s), 'info');
		return schema;
	};
};

var buildSchema = function (s) {
	return s;
}

module.exports = buildSchema;
