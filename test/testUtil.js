/**
 * Common tools for test
 */

var assert = require('assert');
var populator = require('../index.js');
var joi = require('joi');
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

// external modules
module.exports.joi = joi;
module.exports.assert = assert;
// modules to test
module.exports.populator = populator;
// test utility functions
module.exports.setUp = setUp;
module.exports.tearDown = tearDown;
