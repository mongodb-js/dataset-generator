// external packages
var fs = require('fs');
var debug = require('debug')('dataset:parser');
var MongoClient = require('mongodb').MongoClient;
var mongodbUri = require('mongodb-uri');
// internal packages
var Generator = require('./generator');
var schemaBuilder = require('./schema')();

// parse user input, get components ready, connect to mongo
module.exports.connect = function (opts, fn) {
  var user = parseInput(opts);
  readSchema(user, function(schema, dataStream) {
    MongoClient.connect(user.uri, user.clientOptions, function(err, db) {
      debug('INFO: connected to MongoDB @ ', user.uri);
      if(err) throw err;
      var collection = db.collection(user.collection);
      fn(collection, schema, dataStream);
    });
  });
};

module.exports.close = function (opts, fn) {
  var user = parseInput(opts);
  MongoClient.connect(user.uri, function(err, db) {
    db.close();
    fn();
  });
};

function readSchema(user, fn) {
  var schema, dataStream;
  fs.readFile(user.schemaPath, 'utf8', function (err, data) {
    debug('Schema file path: ', user.schemaPath);
    if (err) throw err;
    schema = schemaBuilder.build(JSON.parse(data));
    debug('Schema built as ', schema);
    dataStream = new Generator(schema, user.size);
    fn(schema, dataStream);
  });
}

function parseInput(opts) {
  // parse uri
  var uri;
  if (typeof opts.uri === 'undefined') {
    uri = mongodbUri.format({
      username: '',
      password: '',
      hosts: [
        {
          host: opts.host,
          port: opts.port
        }
      ],
      database: opts.db,
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
    schemaPath: __dirname + '/' +
                    (opts.schemaPath || 'schema_example.json')

  };
}
