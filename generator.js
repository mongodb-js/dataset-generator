var chance = require('chance').Chance();
// var GENERATOR = '_';

var format = require('util').format;
var debugPrint = require('./util').debugPrint;

chance.mixin({
  'user': function() {
    return {
      first: chance.first(),
      last: chance.last(),
      email: chance.email()
    };
  }
});

// todo: singeleton pattern
var DataStream = function (schema, dataLength) {
  // private var
  this.dataLength = dataLength;
  this.restLength = dataLength;
  // mixin
  chance.mixin({
    _: function () {
      // todo: more complex logic
      var o = {};
      var field, type;
      for (field in schema) {
        type = schema[field];
        o[field] = chance[type]();
      }
      return o;
    }
  });
  // log
  debugPrint('op', 'DataStream successfully built');
  debugPrint('verbose', this.toString());
};

DataStream.prototype.numLeft = function () {
  return this.restLength;
};

DataStream.prototype.hasMore = function () {
  return this.restLength > 0;
};

DataStream.prototype.emit = function (step) {
  if (step === undefined) step = 1;
  if (typeof step !== 'number') {
    throw new Error('Not a number');
  }
  if (!this.hasMore()) {
    throw new Error('no more data to emit');
  }

  var i, data = [];
  step = Math.min(step, this.restLength);
  this.restLength -= step;
  for (i = 0; i < step; i++) {
    data.push(chance._());
  }

  debugPrint('op',
    format('DataStream emitted %d docs, %d left', step, this.restLength));

  return data.slice(0);
};

DataStream.prototype.testEmit = function () {
  return chance._();
};

DataStream.prototype.toString = function () {
  return format('<DataStream:%d/%d,%j>',
    this.restLength, this.dataLength, this.testEmit());
};

module.exports = DataStream;
