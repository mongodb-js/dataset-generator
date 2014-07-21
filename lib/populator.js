var debug = require('debug')('Populator');
var Transform = require('stream').Transform;
var util = require('util');
var helpers = require('./helpers');

util.inherits(Populator, Transform);
function Populator(options) {
  if (!(this instanceof Populator))
    return new Populator(options);

  Transform.call(this, {objectMode: true});
  debug('populator initiated');

  this.collection = undefined;
  this.queue = [];
  helpers.connect(helpers.parseOpts(options), function (collection, db) {
    this.collection = collection;
    debug('acquired collection');
    if (this.queue.length > 0) {
      debug('queued chunks ' + this.queue.length);
      this.queue.forEach(function (item) {
        this._transform(item[0], item[1], item[2]);
      }, this);
    }
    this.on('finish', function () {
      db.close();
    });
  }.bind(this));
}

Populator.prototype._transform = function (chunk, encoding, done) {
  if (this.collection === undefined) {
    debug('collection not ready, queued');
    this.queue.push([chunk, encoding, done]);
    this.push('');
  } else {
    this.collection.insert(chunk, {safe: true}, function (err) {
      debug('handled by mongodb');
      this.push(chunk);
      done(err);
    }.bind(this));
  }
};

module.exports = Populator;
