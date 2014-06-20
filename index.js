var debug = require('debug')('dataset:index');
var Inserter = require('./inserter');
var dbUtil = require('./dbUtil');

// assume these are the user input
module.exports = function (opts, fn) {
  var user = dbUtil.parseInput(opts);
  dbUtil.readSchema(user, function(schema, dataStream) {
    dbUtil.connect(user, function(collection) {
      var inserter = new Inserter(collection, dataStream, function() {
        fn();
        dbUtil.close(user, function() {});
      });
      inserter.start();
    });
  });
};
