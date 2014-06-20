// external packages
var fs = require('fs');
var debug = require('debug')('dataset:index');
var MongoClient = require('mongodb').MongoClient;
var mongodbUri = require('mongodb-uri');
// var argv = require('minimist')(process.argv.slice(2));
// internal packages
var Inserter = require('./inserter');
var Generator = require('./generator');
var schemaBuilder = require('./schema')();

// assume these are the user input
module.exports = function (opts, fn) {
  // uri
  var userUri = opts.uri;
  // legacy support for uri
  var userHost = opts.host || 'localhost';
  var userPort = opts.port || 27017;
  var userDb = opts.db || 'test';
  var userServerOptions = opts.serverOptions || {};
  var userClientOptions = opts.clientOptions || {};
  // other config
  var userSize = typeof opts.size === 'number' ? opts.size : 100;
  var userCollection = opts.collection || 'dataset';
  var userSchemaPath = __dirname + '/' +
                  (opts.schemaPath || 'schema_example.json');

  // build a Schema object from user input
  var schema, dataStream;
  fs.readFile(userSchemaPath, 'utf8', function (err, data) {
    debug('Schema file path: ', userSchemaPath);
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
    dataStream = new Generator(schema, userSize);

    // parse uri
    if (typeof userUri === 'undefined') {
      userUri = mongodbUri.format({
        username: '',
        password: '',
        hosts: [
          {
            host: userHost,
            port: userPort
          }
        ],
        database: userDb,
        options: userServerOptions
      });
    }

    // start the job
    MongoClient.connect(userUri, userClientOptions, function(err, db) {
      debug('INFO: connected to MongoDB @ ', userUri);
      if(err) throw err;
      var collection = db.collection(userCollection);
      // initiate the inserter to do the job
      var inserter = new Inserter(collection, dataStream, function() {
        fn();
        db.close();
      });
      // start the inserter
      inserter.start();
    });
  });
};
