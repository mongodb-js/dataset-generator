var debug = require('debug')('dataset:index');
var Inserter = require('./inserter');
var helpers = require('./helpers');
var DataStream = require('./datastream');
var Schema = require('./schema');
var Generator = require('./generator');
var Populator = require('./populator');

module.exports.DEFAULT_OPTIONS = helpers.DEFAULT_OPTIONS;

// assume these are the user input
module.exports.populate = function (opts, fn) {
  helpers.parseUserOpts(opts, function (opts) {
    debug('processed user opts', opts);
    var schema = new Schema(opts.schema);
    var dataStream = new DataStream(schema, opts.size);
    helpers.connect(opts, function(collection, db) {
      var inserter = new Inserter(collection, dataStream, function() {
        fn();
        db.close();
      });
      inserter.start();
    });
  });
};

module.exports.createGeneratorStream = function (opts) {
  return new Generator(opts);
};

module.exports.createPopulatorStream = function (opts) {
  return new Populator(opts);
};
