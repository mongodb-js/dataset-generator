// external packages
var fs = require('fs');
var debug = require('debug')('dataset:dbUtil');
var MongoClient = require('mongodb').MongoClient;
var mongodbUri = require('mongodb-uri');
// internal packages
var Generator = require('./generator');
var schemaBuilder = require('./schema')();

// parse user input, get components ready, connect to mongo
module.exports.connect = function (user, fn) {
  MongoClient.connect(user.uri, user.clientOptions, function(err, db) {
    debug('INFO: connected to MongoDB @ ', user.uri);
    if(err) throw err;
    var collection = db.collection(user.collection);
    fn(collection, db);
  });
};

// module.exports.close = function (user, fn) {
//   MongoClient.connect(user.uri, function(err, db) {
//     db.close();
//     fn();
//   });
// };

module.exports.readSchema = function (user, fn) {
  var schema, dataStream;
  fs.readFile(user.schema, 'utf8', function (err, data) {
    debug('Schema file path: ', user.schema);
    if (err) throw err;
    schema = schemaBuilder.build(JSON.parse(data));
    debug('Schema built as ', schema);
    dataStream = new Generator(schema, user.size);
    fn(schema, dataStream);
  });
};

module.exports.parseInput = function (opts) {
  // parse uri
  var uri;
  if (typeof opts.uri === 'undefined') {
    uri = mongodbUri.format({
      username: '',
      password: '',
      hosts: [
        {
          host: opts.host || 'localhost',
          port: opts.port || 27017
        }
      ],
      database: opts.db || 'test',
      options: opts.serverOptions
    });
  } else {
    uri = opts.uri;
  }
  return {
    uri: uri,
    clientOptions: opts.clientOptions || {},
    size: typeof opts.size === 'number' ? opts.size : 100,
    collection: opts.collection || 'dataset',
    schema: __dirname + '/' +
                    (opts.schema || 'schema_example.json')

  };
};
