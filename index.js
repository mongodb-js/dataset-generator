// external packages
var fs = require('fs');
var debug = require('debug')('dataset:index');
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
// var argv = require('minimist')(process.argv.slice(2));
// internal packages
var Inserter = require('./inserter');
var Generator = require('./generator');
var schemaBuilder = require('./schema')();

// assume these are the user input
module.exports = function (opts, fn) {
  var size = typeof opts.size === 'number' ? opts.size : 100;
  var host = opts.host || 'localhost';
  var port = opts.port || 27017;
  var db = opts.db || 'test';
  var collection = opts.collection || 'dataset';
  var schemaPath = __dirname + '/' +
                  (opts.schemaPath || 'schema_example.json');
  var serverOptions = opts.serverOptions || {};
  var clientOptions = opts.clientOptions || {};

  // to build a Schema object from user input
  var schema, dataStream;
  fs.readFile(schemaPath, 'utf8', function (err, data) {
    debug('Schema file path: ', schemaPath);
    if (err) {
      debug('No schema file is specified. Using default.');
      schema = { first_name: 'first',
                 last_name: 'last',
                 user_email: 'email',
                 cell_phone: 'phone',
                 birthday: 'birthday',
                 description: 'sentence'
               };
    } else {
      schema = schemaBuilder.build(JSON.parse(data));
    }
    debug('Schema built as ', schema);
    dataStream = new Generator(schema, size);

    // core
    var serverConfig = new Server(host, port, serverOptions);
    var mongoclient = new MongoClient(serverConfig, clientOptions);
    mongoclient.open(function(err, mongoclient) {
      debug('INFO: connected to MongoDB');
      if(err) throw err;
      // the collection to dump the generated data
      var _db = mongoclient.db(db);
      var _collection = _db.collection(collection);
      // initiate the inserter to do the job
      var inserter = new Inserter(_collection, dataStream, function() {
        fn();
        mongoclient.close();
      });
      // start the inserter
      inserter.start();
    });
  });
};
