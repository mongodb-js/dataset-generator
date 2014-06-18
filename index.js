// external packages
var fs = require('fs');
var debug = require('debug')('dataset:index');
var MongoClient = require('mongodb').MongoClient;
// var argv = require('minimist')(process.argv.slice(2));
// internal packages
var Inserter = require('./inserter');
var Generator = require('./generator');
var schemaBuilder = require('./schema')();

// assume these are the user input
var main = function (opt, callback) {
  opt.size = opt.size || 100;
  opt.serverName = opt.serverName || 'mongodb://127.0.0.1:27017/';
  opt.dbName = opt.dbName || 'test';
  opt.datasetName = opt.datasetName || 'dataset';
  opt.schemaFile = opt.schema ? (__dirname + '/' + opt.schema) : '';

  // to build a Schema object from user input
  var schema, dataStream;
  fs.readFile(opt.schemaFile, 'utf8', function (err, data) {
    debug('Schema file path: %j', opt.schemaFile);
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
    dataStream = new Generator(schema, opt.size);

    // core
    MongoClient.connect(opt.serverName + opt.dbName, function(err, db) {
      debug('INFO: connected to MongoDB');
      if(err) throw err;
      // the collection to dump the generated data
      var collection = db.collection(opt.datasetName);
      // initiate the inserter to do the job
      var inserter = new Inserter(collection, dataStream, function() {
      	console.log('This is the callback function user defined');
        console.log('Yay! We reached here.');
        callback();
        db.close();
      });
      // start the inserter
      inserter.start();
    });
  });
};

module.exports = main;
