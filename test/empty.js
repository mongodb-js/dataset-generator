var assert = require('assert');
var populator = require('../index.js');

describe('Populator', function () {
	var MongoClient = require('mongodb').MongoClient;
  var myCollection, myDb;

	var options = {
    serverName: 'mongodb://127.0.0.1:27017/',
    dbName: 'test',
    datasetName: 'dataset',
		schema: 'test/schema_empty.json',
		size: 100
	};

  before(function(done) {
  	MongoClient.connect(options.serverName + options.dbName, function(err, db) {
  		if (err) return done(err);
  		myDb = db;
  		myCollection = db.collection(options.datasetName);
  		myCollection.remove({}, {safe: true}, function (err, res) {
  			if (err) done(err);
	  		populator(options, function () { done(); });
  		});
  	});
  });

  after(function(done) {
  	myCollection.drop();
  	myDb.close();
  	done();
  });

	it('should have the correct size', function (done) {
		myCollection.count(function (err, count) {
			if (err) done(err);
			assert.equal(count, options.size);
			done();
		});
	});

	it('entries should be empty', function (done) {
		var cursor = myCollection.find();
		cursor.each(function (err, item) {
			if (err) done(err);
			if (item === null) {
				done();
			} else {
				var keys = Object.keys(item);
				assert(keys.length, 1);
			}
		});
	});

});
