var helpers = require('./helpers'),
  debug = require('debug')('mongodb-datasets:schema:index');

function Schema (sc, size, sib) {
  if (!(this instanceof Schema)) return new Schema(sc);
  debug('======BUILDING PHASE======');
  if (!sc._$meta) sc._$meta = {}; //makeshift
  this.size = sc._$meta.size ? sc._$meta.size : size;
  this.name = sc._$meta.name ? sc._$meta.name : 'untitled'+Date.now();
  debug('schema <%s> being built', this.name);
  this._schema = this;
  this._siblings = sib;
  this._document = helpers.build(sc, '$root', this);
  this._state = { // serve as global state
    index: -1,
    counter: []
  };
  debug('======BUILDING ENDS======');
}

Schema.prototype.next = function () {
  this._state.index += 1;
  debug('======GENERATING ROUND %s======', this._state.index);
  return this._document.next();
};

Schema.prototype.hasNext = function () {
  return this._state.index < this.size - 1;
};

module.exports = Schema;
