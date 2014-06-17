/* inserter.js */

/**
 * A tool to insert data into MongoDB that adaptively adjusts the timing
 * and bulk size for each insertion to maximize performance.
 */

var async = require('async');
var debugDb = require('debug')('inserter:db');
var debugQ = require('debug')('inserter:queue');
var debug = require('debug')('inserter');
var DataStream = require('./generator');

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

  var self = this;
  debug('OP: Building an inserter');

  // error detection
  if (!dataStream instanceof DataStream) {
    throw new Error('Inserter: invalid DataStream object');
  }
  if (!(callback && typeof callback === 'function')) {
    throw new Error('Inserter: invalid callback function');
  }

  // main component
  var _callback = callback;
  var _dataStream = dataStream;
  this.getDataStream = function () { return _dataStream; };
  var _collection = collection;
  this.getCollection = function () { return _collection; };

  // operations and config
  var _active = true;
  var _concurrency = 6;
  var _taskCounter = 0;
  this._bulkSize = 10;

  // statistics
  var _startTime = Date.now();
  this.getStartTime = function () { return _startTime; };
  var _numInserted = 0;
  this.getNumInserted = function () { return _numInserted; };

  // init
  var _queue = async.queue(function (task, callback) {
    var id = task.id;
    var data = task.data;
    var count = data.length;
    debugQ('OP: queue is processing task %d', id);
    _collection.insert(data, { safe: true }, function (err, docs) {
      debugDb('OP: db is handling task %d', id);
      if (err) throw err;
      callback(); // defined in method start
      // statistics
      _numInserted += count;
      var currTime = Date.now();
      var workTime = (currTime - _startTime);
      debug('INFO: %d ms elapsed, total insert %d', workTime, _numInserted);
    });
  }, _concurrency);

  _queue.drain = function () {
    debugQ('VERBOSE: queue is drained');
    if (self.isDone()) {
      debug('INFO: insertion is done');
      _callback(); // user input
    }
  };

  this.pause = function () { _queue.pause(); };
  this.terminate = function () {
    _queue.pause();
    _active = false;
    // todo: add logic to recover un-processed data
  };
  this.isDone = function () {
    return !_active || (!_dataStream.hasMore() && _queue.idle());
  };

  this.getConcurrency = function () { return _concurrency; };
  this.setConcurrency = function (num) {
    if (typeof num === 'number') {
      _concurrency = num;
      _queue.concurrency = num;
    }
  };

  this.refill = function () {
    debugQ('INFO: refilling the queue');
    if (!(_active && _dataStream.hasMore()) || _queue.paused) {
      debugQ('WARNING: refilling terminated');
      return;
    }
    async.whilst(
      function () { // test function
        var ends = _queue.paused || !_active || !_dataStream.hasMore();
        var full = _queue.length() >= _queue.concurrency;
        if (full) debugQ('OP: current session ends, queue is filled');
        if (ends) debugQ('OP: insertion session ends permanently');
        return !(full || ends);
      },
      function (callback) { // task function
        var task = {
          id: ++_taskCounter,
          data: _dataStream.emit(self._bulkSize)
        };
        debugQ('OP: pushing task %d into queue', task.id);
        _queue.push(task, function (err) {
          debugDb('INFO: task %d handled by db', task.id);
          self.refill();
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

  this.start = function () {
    debug('INFO: Inserter starts working');
    _queue.resume();
    if (!(_active && _dataStream.hasMore())) {
      debug('WARNING: Inserter has no more data to work');
      return;
    }
    self.refill();
  };

  debug('INFO: Successfully built the inserter');
};

module.exports = Inserter;
