var helpers = require('./helpers'),
  debug = require('debug')('mongodb-datasets:schema:index');

function Schema (sc, size, dispatcher) {
  if (!(this instanceof Schema)) return new Schema(sc);
  debug('+++++BUILDING+++++');
  helpers.validate(sc);
  if (!sc._$meta) sc._$meta = {}; //makeshift
  this.size = sc._$meta.size ? sc._$meta.size : size;
  this.name = sc._$meta.name ? sc._$meta.name : 'untitled'+Date.now();
  debug('schema <%s> being built', this.name);
  this._schema = this;
  this._dispatcher = dispatcher;
  this._document = helpers.build(sc, '_$root', this);
  this._state = { // serve as global state
    index: 0,
    counter: []
  };
  this._buffer = []; // generated docs not yet returned. FILO
  debug('-----BUILDING-----');
}

// produce even if hasNext() returns false
// this.size does not count the calls solicited by this schema's dependencies
Schema.prototype.next = function () {
  debug('*****GENERATING*****');
  if (this._buffer.length === 0) this.stock();
  debug('schema <%s> round %d',
    this.name, this._state.index - this._buffer.length);
  return this._buffer.shift();
};

Schema.prototype.hasNext = function () {
  return this._state.index < this.size;
};

Schema.prototype.stock = function (env) {
  var data = this._document.next();
  this._buffer.push(data);
  this._state.index += 1;
  return data;
};

Schema.prototype.dump = function () {
  var data = this._buffer;
  this._buffer = [];
  return data;
};

module.exports = Schema;
