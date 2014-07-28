var helpers = require('./helpers'),
  debug = require('debug')('mongodb-datasets:schema:index');

function Schema (sc, size) {
  if (!(this instanceof Schema)) return new Schema(sc);
  debug('======BUILDING PHASE======');
  debug('schema size=%d being built', size);
  this._document = helpers.build(sc, '$root', this);
  this._size = size;
  this._index = 0;
  this._state = { // serve as global state
    size: size,
    counter: []
  };
  debug('======BUILDING ENDS======');
}

Schema.prototype._root = function () {
  return this;
};

Schema.prototype.next = function () {
  this._index += 1;
  debug('======GENERATING ROUND %s======', this._index);
  return this._document.next();
};

module.exports = Schema;
