/**
 * Common tools for test
 */

var assert = require('assert');
var populator = require('../index.js');
var Joi = require('joi');
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;

// connects to the target collection, and possibly clear its content
var setUp = function (options, callback) {
	var serverConfig = new Server(options.host, options.port,
																options.serverOptions);
	var mongoclient = new MongoClient(serverConfig, options.clientOptions);
	mongoclient.open(function(err, mongoclient) {
		if(err) return callback(err);
		var db = mongoclient.db(options.db);
		var collection = db.collection(options.collection);
		collection.remove({}, function(err, res) {
			if(err) return callback(err);
			var connection = {
				serverConfig: serverConfig,
				mongoclient: mongoclient,
				db: db,
				collection: collection
			};
			callback(null, connection);
		});
	});
};

// close the connection, drop the test collection
var tearDown = function (connection, callback) {
	connection.collection.drop();
	connection.mongoclient.close();
	callback();
};

var testCount = function (connection, trueCount, callback) {
	connection.collection.count(function (err, count) {
		assert.equal(null, err);
		assert.equal(trueCount, count);
		callback();
	});
};

var testEach = function (connection, schema, callback) {
	connection.collection.find().each(function (err, item) {
		assert.equal(null, err);
		if(item === null) return callback();
		Joi.validate(item, schema, function(err, val) {
			assert.equal(null, err);
		});
	});
};

// external modules
module.exports.Joi = Joi;
module.exports.assert = assert;
// modules to test
module.exports.populator = populator;
// test utility functions
module.exports.setUp = setUp;
module.exports.tearDown = tearDown;
module.exports.testCount = testCount;
module.exports.testEach = testEach;
