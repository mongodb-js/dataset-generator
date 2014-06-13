// external packages
var MongoClient = require('mongodb').MongoClient;
var argv = require('minimist')(process.argv.slice(2));
// internal packages
var Generator = require('./generator');
var Schema = require('./schema');
var Inserter = require('./inserter');

// assume these are the user input
var serverName = 'mongodb://127.0.0.1:27017/',
    dbName = 'test',
    datasetName = 'dataset',
    size = argv.size,
    schema = {
			first_name: 'first',
			last_name: 'last',
			email: 'email'
		};

// to build a Schema object from user input
var schema = new Schema(schema);

// get the customized iterator to generate random data
var dataStream = new Generator(schema);

// connect to MongoDB
MongoClient.connect(serverName + dbName, function(err, db) {
  if(err) throw err;

  var collection = db.collection(datasetName);

  var inserter = new Inserter(collection, dataStream, function() {
  	console.log('job completed');
  });

  while (inserter.getNumDataLeft() > 0) {
  	inserter.startInsertion();
  }

});

