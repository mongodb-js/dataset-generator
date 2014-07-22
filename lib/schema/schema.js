var debug = require('debug')('dataset:schema');
var helpers = require('./helpers');

function Schema (sc) {
  if (!(this instanceof Schema)) return new Schema(sc);
  this._document = helpers.build(sc, '$root', this);
  // this._context = new Context(this); // should not call Schema's context
  this._state = { // serve as global state
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
