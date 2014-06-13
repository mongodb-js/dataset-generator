var MongoClient = require('mongodb').MongoClient;

var format = require('util').format;
var debugPrint = require('./util').debugPrint;

var Inserter = function (collection, dataStream, callback) {
  // todo: check valid input
  // todo: private variable https://code.google.com/p/jslibs/wiki/JavascriptTips#Objects_private_and_public_members
  // todo: prototype function vs constructor function http://stackoverflow.com/questions/422476/setting-methods-through-prototype-object-or-in-constructor-difference
  this.callback = callback;
  this.dataStream = dataStream;
  this.collection = collection;
  this.maxThreads = 6;
  this.currThreads = 0;
  this.bulkSize = 1;
  this.startTime = Date.now();
  this.pause = true;
  this.insertOptions = {};
  this.inserted = 0;

  debugPrint('inserter is built', 'info');
  debugPrint(format('dataStream: %j', this.dataStream.testEmit()), 'info');
};

Inserter.prototype.getNumDataLeft = function () {
  return this.dataStream.numLeft();
};

Inserter.prototype.getUnfinishedData = function () {
  return this.dataStream.copy(); // todo: copy
};

Inserter.prototype.pauseInsertion = function () {
  this.pause = true;
  debugPrint('insertion is paused', 'info');
};

// PROBLEM. MUST KEEP CALLING THIS METHOD
Inserter.prototype.startInsertion = function () {
  if (!this.dataStream.hasMore()) { // todo: hasMore
    if (typeof this.callback === "function") {
      this.callback();
    }
    return;
  }

  var that = this;
  if (this.currThreads < this.maxThreads) {
    var data = this.dataStream.emit(this.bulkSize);
    console.log(this.getNumDataLeft() + 'left');
    console.log(this.inserted+'inserted');
    console.log(this.currThreads + 'threads');
    this.pause = false;
    this.currThreads++;

    this.collection.insert(data,
      this.insertOptions, function (err, docs) { //indent?
        console.log('in');
        if (err) throw err;
        var currTime = Date.now();
        var workTime = Math.round((currTime - that.startTime) / 1000);
        debugPrint(format('current num threads: %d', that.currThreads), 'info');
        that.currThreads--;
        that.inserted += data.length; // change of bulkSize
        debugPrint(format('%d inserted till now', that.inserted), 'info');
    });
  } else {
    // debugPrint('reached max num threads', 'info');
  }
};

module.exports = Inserter;
