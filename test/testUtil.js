/**
 * Common tools for test
 */

var chance = require('chance').Chance();
var populator = require('../index.js');
var dbUtil = require('../dbUtil');
var Joi = require('joi');
var async = require('async');

var defaultOptions = {
  host: 'localhost',
  port: '27017',
  db: 'test',
  collection: 'dataset'
};

var regex = {
  phone: /(\(\d{3}\)\s*)(\d{3})-(\d{4})/,
  exp: /(\d{2})\/(\d{4})/
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
function tearDown (connection, fn) {
  connection.collection.drop();
  connection.db.close();
  fn();
}

function merge_objects(defaults, instance) {
    var obj3 = {}, attrname;
    for (attrname in defaults) { obj3[attrname] = defaults[attrname]; }
    for (attrname in instance) { obj3[attrname] = instance[attrname]; }
    return obj3;
}

function sampleAndStrip(array, count, fn) {
  var sample = chance.pick(array, count);
  async.each(sample,
             function (item, callback) {
               item._id = undefined;
               callback(null);
             },
             function (err) {
              if (err) throw err;
              fn(sample);
             });
}

function testWithTolerance(tolerance, count, testFn) {
  var numFailed = 0;
  // async.times(count, function
}

// external modules
module.exports.Joi = Joi;
module.exports.chance = chance;
module.exports.assert = require('assert');
module.exports.async = async;
// modules to test
module.exports.populator = populator;
// test utility functions
module.exports.setUp = setUp;
module.exports.tearDown = tearDown;
// general utilities
module.exports.sampleAndStrip = sampleAndStrip;
module.exports.regex = regex;
