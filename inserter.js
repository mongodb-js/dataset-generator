var MongoClient = require('mongodb').MongoClient;

var debugLogger = function (msg) {
  console.log(msg);
}

var Inserter = function (collection, dataStream, callback) {
  // todo: check valid input
  // todo: private variable https://code.google.com/p/jslibs/wiki/JavascriptTips#Objects_private_and_public_members
  // todo: prototype function vs constructor function http://stackoverflow.com/questions/422476/setting-methods-through-prototype-object-or-in-constructor-difference
  this.callback = callback;
  this.dataStream = dataStream;
  this.collection = collection;
  this.maxThreads = 6;
  this.currThreads = 0;
  this.bulkSize = 100;
  this.startTime = Date.now();
  this.pause = true;
  this.insertOptions = {};
  this.inserted = 0;
};

Inserter.prototype.getUnfinishedData = function () {
  return this.dataStream.copy(); // todo: copy
};

Inserter.prototype.pauseInsertion = function () {
  this.pause = true;
};

// PROBLEM. MUST KEEP CALLING THIS METHOD
Inserter.prototype.startInsertion = function () {
  var that = this;

  if (!this.dataStream.hasMore()) { // todo: hasMore
    if (typeof this.callback === "function") {
      this.callback();
    }
    return;
  }
  if (this.currThreads < this.maxThreads) {
    this.pause = false;
    this.currThreads++;
    this.collection.insert(this.dataStream.emit(this.bulkSize),
      this.insertOptions, function (err, docs) { //indent?
        if (err) throw err;
        var currTime = Date.now();
        var workTime = Math.round((currTime - that.startTime) / 1000);
        that.currThreads--;
        that.inserted += that.bulkSize; // change of bulkSize
    });
  }
};

module.exports = Inserter;
