var chance = require('chance').Chance();
// var GENERATOR = '_';

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
var DataStream = function (schema) {
  // private
  this.dataLength = 100;
  this.restLength = 100;

  chance.mixin({
    '_': function () {
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
    throw StopIteration; // not defined?
  }

  var i, data = [];
  step = Math.min(step, this.restLength);
  this.restLength -= step;
  for (i = 0; i < step; i++) {
    data.push(chance['_']());
  }
  return data;
};

module.exports = DataStream;
