var debug = require('debug')('dataset:index');
var Inserter = require('./inserter');
var helper = require('./helper');
var Generator = require('./generator');
var schemaBuilder = require('./schema')();

// assume these are the user input
module.exports = function (opts, fn) {
  helper.parseUserOpts(opts, function (opts) {
    var schema = schemaBuilder.build(opts.schema);
    var dataStream = new Generator(schema, opts.size);
    helper.connect(opts, function(collection, db) {
      var inserter = new Inserter(collection, dataStream, function() {
        fn();
        db.close();
      });
      inserter.start();
    });
  });
};
