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
  debugPrint('op', 'Building an inserter');

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
  this._bulkSize = 100;

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
    debugPrint('op', format('queue is processing task %d', id));
    _collection.insert(data, { safe: true }, function (err, docs) {
      debugPrint('op', format('db is handling task %d', id));
      if (err) throw err;
      callback(); // defined in method start
      // statistics
      _numInserted += count;
      var currTime = Date.now();
      var workTime = (currTime - _startTime);
      debugPrint('info',
        format('%d ms elapsed, total insert %d', workTime, _numInserted));
    });
  }, _concurrency);

  _queue.drain = function () {
    debugPrint('verbose', 'queue is drained');
    if (self.isDone()) {
      debugPrint('info', 'insertion is done');
      _callback(); // user input
    }
  };

  this.pause = function () { _queue.pause(); };
  this.terminate = function () {
    _queue.pause();
    _active = false;
    // add logic to recover un-processed data
  };
  this.isDone = function () {
    // console.log(_active);
    // console.log(_dataStream.hasMore());
    // console.log(_queue.idle());
    // console.log(!_active || (!_dataStream.hasMore() && _queue.idle()));
    return !_active || (!_dataStream.hasMore() && _queue.idle());
  };

  this.getConcurrency = function () { return _concurrency; };
  this.setConcurrency = function (num) {
    if (typeof num === 'number') {
      _concurrency = num;
      _queue.concurrency = num;
    }
  };

  this.start = function () {
    debugPrint('info', 'Inserter starts working');
    if (!_active) return;

    var delay = 10; // delay in callback, adjusted adpatively
    async.whilst(
      function () { // test function
        var rtn = !_queue.paused && _active && _dataStream.hasMore();
        if (!rtn) debugPrint('op', 'current insertion session ends');
        return rtn;
      },
      function (callback) { // task function
        if (_queue.running() < _queue.concurrency) {
          console.log(_queue.length());
          console.log(_queue.running());
          var task = {
            id: ++_taskCounter,
            data: _dataStream.emit(self._bulkSize)
          };
          debugPrint('op', format('pushing task %d into queue', task.id));
          _queue.push(task, function (err) {
            debugPrint('info', format('task %d handled by db', task.id));
          });
          delay = Math.max(1, delay / 2);
        } else {
          delay = delay * 2;
        }
        setTimeout(callback(), delay);
      },
      function (err) {
        if (err) {
          debugPrint('error', 'whilst reported error');
          throw err;
        }
      }
    );
  };
  // debug print
  debugPrint('info', 'Successfully built the inserter');
};

module.exports = Inserter;
