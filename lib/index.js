var debug = require('debug')('dataset:index');
var Inserter = require('./inserter');
var helpers = require('./helpers');
var Generator = require('./generator');
var Schema = require('./schema');

// assume these are the user input
module.exports.populate = function (opts, fn) {
  helpers.parseUserOpts(opts, function (opts) {
    debug('processed user opts', opts);
    var schema = new Schema(opts.schema);
    var dataStream = new Generator(schema, opts.size);
    helpers.connect(opts, function(collection, db) {
      var inserter = new Inserter(collection, dataStream, function() {
        fn();
        db.close();
      });
      inserter.start();
    });
  });
};
