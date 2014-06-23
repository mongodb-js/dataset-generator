var debug = require('debug')('dataset:index');
var Inserter = require('./inserter');
var util = require('./dbUtil');
var argv = require('minimist')(process.argv.slice(2));

// assume these are the user input
module.exports = function (opts, fn) {
  var user = util.parseInput(opts);
  util.readSchema(user, function(schema, dataStream) {
    util.connect(user, function(collection, db) {
      var inserter = new Inserter(collection, dataStream, function() {
        fn();
        db.close();
      });
      inserter.start();
    });
  });
};
