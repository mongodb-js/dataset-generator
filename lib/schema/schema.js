var debug = require('debug')('dataset:schema');

var Document = require('./document');

function Schema (sc) {
  if (!(this instanceof Schema)) return new Schema(sc);
  this._document = new Document(sc, this);
  // this._context = new Context(this); // should not call Schema's context
  this._state = { // serve as global state
    counter: []
  };
}

Schema.prototype.getRoot = function () {
  return this;
};

Schema.prototype.next = function () {
  return this._document.next();
};

module.exports = Schema;
