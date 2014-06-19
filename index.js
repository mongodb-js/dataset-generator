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
var main = function (options, callback) {
  var size = typeof options.size === 'number' ? options.size : 100;
  var host = options.host || 'localhost';
  var port = options.port || 27017;
  var db = options.db || 'test';
  var collection = options.collection || 'dataset';
  var schemaPath = __dirname + '/' +
                  (options.schemaPath || 'schema_example.json');
  var serverOptions = options.serverOptions || {};
  var clientOptions = options.clientOptions || {};

  // to build a Schema object from user input
  var schema, dataStream;
  fs.readFile(schemaPath, 'utf8', function (err, data) {
    debug('Schema file path: %j', schemaPath);
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
    debug('Schema built as %j', schema);
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
        callback();
        mongoclient.close();
      });
      // start the inserter
      inserter.start();
    });
  });
};

module.exports = main;
