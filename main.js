// an experiment script to insert random data into test databse

var MongoClient = require('mongodb').MongoClient;
var gen = require('./generator');

var format = require('util').format;
var argv = require('minimist')(process.argv.slice(2));

var serverName = 'mongodb://127.0.0.1:27017/',
    dbName = 'test',
    datasetName = 'dataset',
    size = argv.size;

var bulkSize = 100;

// if (!(serverName && dbName)) {
//     serverName = 'mongodb://127.0.0.1:27017/';
//     dbName = 'test';
// }

// if (!collectionName) {
//     collectionName = 'test_table';
// }

function printUsage() {
    console.log("dude, use me correctly");
}
console.log(argv);
var dbURL = serverName + dbName;

MongoClient.connect(dbURL, function(err, db) {
    if(err) throw err;

    var collection = db.collection(datasetName);

    var data, i;

    while(size > 0) {
        data = [];
        i = size;
        size = Math.max(0, size - bulkSize);
        console.log(data);
        for( ; i > size; i--) {
            data.push(gen.user());
        }
        collection.insert(data, function(err, docs) {
            if(err) throw err;
        });
        console.log(format("inserted %d entries", data.length));
    }

    // db.close();

    // collection.insert(data, function(err, docs) {
        // collection.count(function(err, count) {
        //     console.log(format("count = %s", count));
        // });

        // collection.find().toArray(function(err, res) {
        //     console.dir(res);
        //     db.close();
        // });
    // });
});
