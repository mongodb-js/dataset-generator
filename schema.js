/* schema.js */

/**
 * A representation of schema specified by user that records the name and
 * the type of random data for each field. The type of random data must be
 * supported by Chance.js. For example, {user_email: 'email'} means
 * that the data corresponding to the field 'user_email' is supplied by
 * chance.email()
 */

/**
 * To-do's
 * embedded schema, e.g. {user: {id: 'number', user_email: 'email'}}
 * complex random data, e.g. {products: 'number-text'} should
 * generate things like '3-foo', '234-bar'
 * reference relationship between schema, e.g. 'manager_id' in Employee
 * collection should correspond to 'id' in Manager collection
 */

var debug = require('debug')('schema');

// a 'class' that converts user input into legal schema object
// that is recognized by generator
// temporarily not in use, still in progress
var Schema = function () {
	if (Schema.prototype._singletonInstance) {
		debug('WARNING: Schema constructor called multiple times');
		return Schema.prototype._singletonInstance;
	}
	Schema.prototype._singletonInstance = this;

	var schema = {};
	this.getSchema = function () {
		return schema;
	};
	this.buildSchema = function (s) { // todo: actually build the object
		schema = s;
		debug('OP: Schema is built: %j', s);
		return schema;
	};
};

// a temporary convenient substitude
var buildSchema = function (s) {
	return s;
};

module.exports = buildSchema;
