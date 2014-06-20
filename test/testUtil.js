/**
 * Common tools for test
 */

var assert = require('assert');
var populator = require('../index.js');
var Joi = require('joi');
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var mongodbUri = require('mongodb-uri');

var defaultOptions = {
  hosts: [
    {
      host: 'localhost',
      port: '27017'
    }
  ],
  database: 'test',
  collection: 'dataset'
};

// connects to the target collection, and possibly clear its content
function setUp (inputOptions, callback) {
  var options = merge_objects(defaultOptions, inputOptions);
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
}

// close the connection, drop the test collection
function tearDown (connection, callback) {
  connection.collection.drop();
  connection.mongoclient.close();
  callback();
}

function testCount (connection, trueCount, callback) {
  connection.collection.count(function (err, count) {
    assert.equal(null, err);
    assert.equal(trueCount, count);
    callback();
  });
}

function testEach (connection, schema, callback) {
  connection.collection.find().each(function (err, item) {
    assert.equal(null, err);
    if(item === null) return callback();
    Joi.validate(item, schema, function(err, val) {
      assert.equal(null, err);
    });
  });
}

function merge_objects(defaults, instance) {
    var obj3 = {}, attrname;
    for (attrname in defaults) { obj3[attrname] = defaults[attrname]; }
    for (attrname in instance) { obj3[attrname] = instance[attrname]; }
    return obj3;
}

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
