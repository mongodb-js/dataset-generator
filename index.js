var debug = require('debug')('dataset:index');
var Inserter = require('./inserter');
var parser = require('./parser');

// assume these are the user input
module.exports = function (opts, fn) {
  parser.connect(opts, function(collection, schema, dataStream) {
    var inserter = new Inserter(collection, dataStream, function() {
      fn();
      parser.close(opts, function() {});
    });
    inserter.start();
  });
};
