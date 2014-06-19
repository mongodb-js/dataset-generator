/* inserter.js */

/**
 * A tool to insert data into MongoDB that adaptively adjusts the timing
 * and bulk size for each insertion to maximize performance.
 */

var async = require('async');
var debug = require('debug')('dataset:inserter');
var debugDb = require('debug')('dataset:inserter:db');
var debugQ = require('debug')('dataset:inserter:queue');

/**
 * Inserter constructor
 *
 * @param collection - a MongoDB collection to insert the data
 * @param dataStream - a DataStream object as specified in generator.js
 * @param callback - the function to call when insertion is finished
 */
var Inserter = function (collection, dataStream, callback) {
  if (!(this instanceof Inserter)) {
    return new Inserter(collection, dataStream, callback);
  }

  // main component
  this._callback = callback;
  this._dataStream = dataStream;
  this._collection = collection;

  // operations and config
  this._active = true;
  this._concurrency = 6;
  this._taskCounter = 0;
  this._bulkSize = 10;

  // statistics
  this._startTime = Date.now();
  this._numInserted = 0;

  // init
  var that = this;
  this._queue = async.queue(function (task, callback) {
    var id = task.id;
    var data = task.data;
    var count = data.length;
    debugQ('OP: queue is processing task %d', id);
    that._collection.insert(data, { safe: true }, function (err, docs) {
      debugDb('OP: db is handling task %d', id);
      if (err) throw err;
      callback(); // defined in method start
      // statistics
      that._numInserted += count;
      var currTime = Date.now();
      var workTime = (currTime - that._startTime);
      debug('INFO: %d ms elapsed, total insert %d',
            workTime, that._numInserted);
    });
  }, this._concurrency);

  this._queue.drain = function () {
    debugQ('VERBOSE: queue is drained');
    if (that.isDone()) {
      debug('INFO: insertion is done');
      that._callback(); // user input
    }
  };

  debug('INFO: Successfully built the inserter');
};

Inserter.prototype.start = function () {
  debug('INFO: Inserter starts working');
  this._queue.resume();
  if (!(this._active && this._dataStream.hasNext())) {
    debug('WARNING: Inserter has no more data to work');
    return this._queue.drain();
  }
  this._refill();
};

Inserter.prototype.pause = function () {
  this._queue.pause();
};

Inserter.prototype.terminate = function () {
  this._queue.pause();
  this._active = false;
  // todo: add logic to recover un-processed data
};

Inserter.prototype.isDone = function () {
  return !this._active ||
        (!this._dataStream.hasNext() && this._queue.idle());
};

Inserter.prototype._refill = function () {
  debugQ('INFO: refilling the queue');
  if (!(this._active && this._dataStream.hasNext()) || this._queue.paused) {
    debugQ('WARNING: refilling terminated');
    return;
  }
  var that = this;
  async.whilst(
    function () { // test function
      var ends = that._queue.paused ||
                !that._active || !that._dataStream.hasNext();
      var full = that._queue.length() >= that._queue.concurrency;
      if (full) debugQ('OP: current session ends, queue is filled');
      if (ends) debugQ('OP: insertion session ends permanently');
      return !(full || ends);
    },
    function (callback) { // task function
      var task = {
        id: ++that._taskCounter,
        data: that._dataStream.next(that._bulkSize)
      };
      debugQ('OP: pushing task %d into queue', task.id);
      that._queue.push(task, function (err) {
        debugDb('INFO: task %d handled by db', task.id);
        that._refill();
      });
      callback();
    },
    function (err) {
      if (err) {
        debug('ERROR: whilst reported error');
        throw err;
      }
    }
  );
};

module.exports = Inserter;
