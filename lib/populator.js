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

  this.collection = undefined;
  this.queue = [];
  helpers.connect(helpers.parseOpts(options), function (collection, db) {
    this.collection = collection;
    debug('acquired collection');
    if (this.queue.length > 0) {
      debug('queued chunks ' + this.queue.length);
      this.queue.forEach(function (item) {
        this._write(item[0], item[1], item[2]);
      }, this);
    }
    this.on('finish', function () {
      db.close();
    });
  }.bind(this));
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
