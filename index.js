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
  options.size = options.size || 100;
  options.host = options.host || 'localhost';
  options.port = options.port || 27017;
  options.db = options.db || 'test';
  options.collection = options.collection || 'dataset';
  options.schema = options.schema ? (__dirname + '/' + options.schema) : '';
  options.serverOptions = options.serverOptions || {};
  options.clientOptions = options.clientOptions || {};

  // to build a Schema object from user input
  var schema, dataStream;
  fs.readFile(options.schema, 'utf8', function (err, data) {
    debug('Schema file path: %j', options.schema);
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
    dataStream = new Generator(schema, options.size);

    // core
    var serverConfig = new Server(options.host, options.port,
                                  options.serverOptions);
    var mongoclient = new MongoClient(serverConfig, options.clientOptions);
    mongoclient.open(function(err, mongoclient) {
      debug('INFO: connected to MongoDB');
      if(err) throw err;
      // the collection to dump the generated data
      var db = mongoclient.db(options.db);
      var collection = db.collection(options.collection);
      // initiate the inserter to do the job
      var inserter = new Inserter(collection, dataStream, function() {
        callback();
        mongoclient.close();
      });
      // start the inserter
      inserter.start();
    });
  });
};

module.exports = main;
