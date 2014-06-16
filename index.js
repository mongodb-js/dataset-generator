// external packages
var MongoClient = require('mongodb').MongoClient;
var argv = require('minimist')(process.argv.slice(2));
// internal packages
var Generator = require('./generator');
var schemaBuilder = require('./schema');
var Inserter = require('./inserter');
var debugPrint = require('./util').debugPrint;

// assume these are the user input
var serverName = 'mongodb://127.0.0.1:27017/',
    dbName = 'test',
    datasetName = 'dataset',
    size = argv.size,
    rawSchema = {
			first_name: 'first',
			last_name: 'last',
			email: 'email'
		};

// to build a Schema object from user input
var schema = schemaBuilder(rawSchema);

// get the customized iterator to generate random data
var dataStream = new Generator(schema, size);

// connect to MongoDB
MongoClient.connect(serverName + dbName, function(err, db) {
  debugPrint('info', 'connected to MongoDB');
  if(err) throw err;

  // the collection to dump the generated data
  var collection = db.collection(datasetName);

  // initiate the inserter to do the job
  var inserter = new Inserter(collection, dataStream, function() {
  	console.log('This is the callback function user defined');
    console.log('Yay! We reached here.');
    db.close();
  });

  inserter.start();

});

