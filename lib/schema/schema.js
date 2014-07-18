var debug = require('debug')('dataset:schema');
var util = require('util');
var stream = require('stream');

var Document = require('./document');

function Schema (sc) {
  if (!(this instanceof Schema)) return new Schema(sc);
  stream.Readable.call(this, {objectMode: true});
  this._document = new Document(sc, this);
  // this._context = new Context(this); // should not call Schema's context
  this._state = { // serve as global state
    counter: []
  };
}
util.inherits(Schema, stream.Readable);

Schema.prototype.getRoot = function () {
  return this;
};

Schema.prototype.next = function () {
  return this._document.next();
};

Schema.prototype._read = function (n) {
  this.push(this._document.read(n));
};

module.exports = Schema;
