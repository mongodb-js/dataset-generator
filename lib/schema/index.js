var helpers = require('./helpers');

function Schema (sc, size) {
  if (!(this instanceof Schema)) return new Schema(sc);
  this._document = helpers.build(sc, '$root', this);
  // this._context = new Context(this); // should not call Schema's context
  this._size = size;
  this._state = { // serve as global state
    size: size,
    counter: []
  };
}

Schema.prototype._root = function () {
  return this;
};

Schema.prototype.next = function () {
  return this._document.next();
};

module.exports = Schema;
