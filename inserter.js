// var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var format = require('util').format;
var debugPrint = require('./util').debugPrint;
var DataStream = require('./generator');

var Inserter = function (collection, dataStream, callback) {
  // todo: check valid input
  // todo: private variable https://code.google.com/p/jslibs/wiki/JavascriptTips#Objects_private_and_public_members
  // todo: prototype function vs constructor function http://stackoverflow.com/questions/422476/setting-methods-through-prototype-object-or-in-constructor-difference
  var self = this;
  debugPrint('verbose', 'Building an inserter');

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
  this._bulkSize = 1;

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
    debugPrint('op', format('processing task %d with %d docs', id, count));
    _collection.insert(data, { safe: true }, function (err, docs) {
      debugPrint('op', format('task %d was handled by db', id));
      if (err) throw err;
      callback();
      // statistics
      _numInserted += count;
      var currTime = Date.now();
      var workTime = Math.round((currTime - _startTime) / 1000);
      debugPrint(format('%d seconds have elapsed', workTime), 'info');
      debugPrint(format('%d docs inserted till now', _numInserted), 'info');
    });
  }, _concurrency);
  _queue.drain = function () {
    if (self.isDone()) _callback();
  };

  this.pause = function () { _queue.pause(); };
  this.terminate = function () {
    _queue.pause();
    _active = false;
    // add logic to recover un-processed data
  };
  this.isDone = function () {
    return !_active || (!_dataStream.hasMore && _queue.idle());
  };
  this.getConcurrency = function () { return _concurrency; };
  this.setConcurrency = function (num) {
    if (typeof num === 'number') {
      _concurrency = num;
      _queue.concurrency = num;
    }
  };

  this.start = function () {
    if (!_active) return;
    async.whilst(
      function () {
        return !(_queue.paused && self.isDone());
      },
      function () {
        if (_queue.length() === 0) {
          var task = {
            id: ++_taskCounter,
            data: _dataStream.emit(self._bulkSize)
          };
          debugPrint('op', format('pushing task %d into queue', task.id));
          _queue.push(task, function (err) {
            debugPrint('op', format('callback for task %d', task.id));
          });
        }
      },
      function (err) {
        debugPrint('error', 'whilst report error');
        throw err;
      }
    );
  };
  // debug print
  debugPrint('verbose', 'Successfully built the inserter');
  debugPrint(format('verbose', 'dataStream: %j', this.dataStream.testEmit()));
};

module.exports = Inserter;
