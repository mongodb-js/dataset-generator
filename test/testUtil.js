/**
 * Common tools for test
 */

var assert = require('assert');
var populator = require('../index.js');
var Joi = require('joi');
var dbUtil = require('../dbUtil');

var defaultOptions = {
  host: 'localhost',
  port: '27017',
  db: 'test',
  collection: 'dataset'
};

// connects to the target collection, and possibly clear its content
function setUp (inputOptions, fn) {
  var options = merge_objects(defaultOptions, inputOptions);
  var user = dbUtil.parseInput(options);
  dbUtil.connect(user, function(collection, db) {
    collection.remove({}, function(err, res) {
      if(err) return fn(err);
      var connection = {
        user: user,
        db: db,
        collection: collection
      };
      fn(null, connection);
    });
  });
}

// close the connection, drop the test collection
function tearDown (connection, callback) {
  connection.collection.drop();
  connection.db.close();
  callback();
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
