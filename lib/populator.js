var debug = require('debug')('Populator');
var Writable = require('stream').Writable;
var util = require('util');
var helpers = require('./helpers');

util.inherits(Populator, Writable);
function Populator(options) {
  if (!(this instanceof Populator))
    return new Populator(options);

  Writable.call(this, {objectMode: true});
  debug('populator initiated');

  var that = this;
  this.collection = undefined;
  this.queue = [];
  helpers.connect(helpers.parseOpts(options), function (collection, db) {
    that.collection = collection;
    debug('acquired collection');
    if (that.queue.length > 0) {
      debug('queued chunks ' + that.queue.length);
      that.queue.forEach(function (item) {
        that._write(item[0], item[1], item[2]);
      });
    }
    that.on('finish', function () {
      db.close();
    });
  });
}

Populator.prototype._write = function (chunk, encoding, callback) {
  if (this.collection === undefined) {
    debug('collection not ready, queued');
    this.queue.push([chunk, encoding, callback]);
  } else {
    this.collection.insert(chunk, {safe: true}, function (err) {
      debug('handled by mongodb');
      callback(err);
    });
  }
};

module.exports = Populator;
