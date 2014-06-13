// external packages
var MongoClient = require('mongodb').MongoClient;
var argv = require('minimist')(process.argv.slice(2));
// internal packages
var Generator = require('./generator');
var schemaBuilder = require('./schema');
var Inserter = require('./inserter');

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
size = 10;
// to build a Schema object from user input
var schema = schemaBuilder(rawSchema);

// get the customized iterator to generate random data
var dataStream = new Generator(schema, size);

// connect to MongoDB
MongoClient.connect(serverName + dbName, function(err, db) {
  if(err) throw err;

  // the collection to dump the generated data
  var collection = db.collection(datasetName);

  // initiate the inserter to do the job
  var inserter = new Inserter(collection, dataStream, function() {
  	console.log('job completed');
  });

  // this is a temporary makeshift, should not have this while loop
  var timer = Date.now();
  while (inserter.getNumDataLeft() > 0) {
  	// console.log(inserter.getNumDataLeft());
  	inserter.startInsertion();
    while (Date.now() - timer < 500) {
      ;
    }
    timer = Date.now();
  }

});

