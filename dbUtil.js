// external packages
var fs = require('fs');
var path = require('path');
var debug = require('debug')('dataset:dbUtil');
var MongoClient = require('mongodb').MongoClient;
var mongodbUri = require('mongodb-uri');

// parse user input, get components ready, connect to mongo
module.exports.connect = function (user, fn) {
  MongoClient.connect(user.uri, user.clientOptions, function(err, db) {
    debug('INFO: connected to MongoDB @ ', user.uri);
    if(err) throw err;
    var collection = db.collection(user.collection);
    fn(collection, db);
  });
};

module.exports.parseUserOpts = function (opts, callback) {
  var rtn = {
    uri: opts.uri,
    clientOptions: opts.clientOptions || {},
    size: typeof opts.size === 'number' ? opts.size : 100,
    collection: opts.collection || 'dataset',
    schema: opts.schema,
    schemaPath: opts.schemaPath || 'schema_example.json'
  };
  // parse uri
  if (typeof rtn.uri === 'undefined') {
    rtn.uri = mongodbUri.format({
      username: opts.username ? opts.username : '',
      password: opts.password ? opts.password : '',
      hosts: [
        {
          host: opts.host || 'localhost',
          port: opts.port || 27017
        }
      ],
      database: opts.db || 'test',
      options: opts.serverOptions
    });
  }
  // construct schema
  if (typeof rtn.schema !== 'undefined') {
    return callback(rtn);
  }
  var filePath = path.resolve(rtn.schemaPath);
  fs.readFile(filePath, 'utf8', function (err, data) {
    debug('Schema file path: ', filePath);
    if (err) throw err;
    rtn.schema = JSON.parse(data);
    callback(rtn);
  });
};
