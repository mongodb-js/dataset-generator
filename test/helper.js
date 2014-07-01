/**
 * Common tools for test
 */

var chance = require('chance').Chance();
var populator = require('../index.js');
var dbUtil = require('../helper');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var debug = require('debug')('dataset:testUtil');
var _ = require('underscore');

var defaults = {
  host: 'localhost',
  port: '27017',
  db: 'test',
  collection: 'dataset'
};

var regex = {
  phone: /(\(\d{3}\)\s*)(\d{3})-(\d{4})/,
  exp: /(\d{2})\/(\d{4})/
};

// close the connection, drop the test collection
function tearDown (connection, fn) {
  connection.collection.drop();
  connection.db.close();
  if (typeof fn === 'function') fn();
}

// connects to the target collection, and possibly clear its content
function setUp (testOpts, callback) {
  var opts = _.defaults(testOpts, defaults);
  dbUtil.parseUserOpts(opts, function (opts) {
    MongoClient.connect(opts.uri, opts.clientOptions, function(err, db) {
      debug('INFO: connected to MongoDB @ ', opts.uri);
      if(err) return callback(err);
      var collection = db.collection(opts.collection);
      collection.remove({}, function(err, res) {
        if(err) return callback(err);
        populator(opts, function () {
          var connection = {
            db: db,
            collection: collection
          };
          callback(null, connection);
        });
      });
    });
  });
}

function getResults (testOpts, callback) {
  setUp(testOpts, function (err, connection) {
    if (err) return callback(err);
    connection.collection.find().toArray(function (err, items) {
      if (err) return callback(err);
      callback(null, items);
      tearDown(connection);
    });
  });
}

function sampleAndStrip(array, count, fn) {
  var sample = chance.pick(array, count);
  async.each(sample,
    function (item, callback) {
      item._id = undefined;
      callback();
    },
    function (err) {
      if (err) throw err;
      fn(sample);
  });
}

// test utility functions
module.exports.setUp = setUp;
module.exports.tearDown = tearDown;
// general utilities
module.exports.sampleAndStrip = sampleAndStrip;
module.exports.regex = regex;
module.exports.getResults = getResults;
