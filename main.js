// an experiment script to insert random data into test databse

var MongoClient = require('mongodb').MongoClient;
    format = require('util').format,
    gen = require('./data_gen.js');

MongoClient.connect("mongodb://127.0.0.1:27017/test",
                    function(err, db) {
    if(err) throw err;

    var collection = db.collection("dataset");

    collection.insert(gen.user(), function(err, docs) {
        collection.count(function(err, count) {
            console.log(format("count = %s", count));
        });

        collection.find().toArray(function(err, res) {
            console.dir(res);
            db.close();
        });
    });
});
