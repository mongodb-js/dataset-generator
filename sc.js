var Chance = require('chance');
var debug = require('debug')('dataset:schema');
var _ = require('underscore');
var chance;
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

function Schema (sc) {
  if (!(this instanceof Schema)) return new Schema(sc);
  this._schema = new Document(sc);
}

Schema.prototype.emit = function () {
  return this._schema.emit();
};

// doc must be an object or an array of object
function Document (document) {
  if (!(this instanceof Document)) return new Document(document);

  this._array = document instanceof Array;
  this._document = {};
  var doc = this._array ? document[0] : document;
  for (var name in doc) {
    var data = doc[name];
    if (typeof data === 'string' ||
       (data instanceof Array && typeof data[0] === 'string')) {
      this._document[name] = new Field(data);
    } else {
      this._document[name] = new Document(data);
    }
  }
}

Document.prototype._produce = function () {
  var data = {};
  for (var name in this._document) {
    data[name] = this._document[name].emit();
  }
  return data;
};

Document.prototype.emit = function () {
  if (this._array) {
    var data = [];
    for (var i = _.random(1, 3); i > 0; i--) {
      data.push(this._produce());
    }
    return data;
  } else {
    return this._produce();
  }
};

// f must be string or an array of string
function Field (f) {
  if (!(this instanceof Field)) return new Field(f);

  this._array = false;
  this._field = f;
  if (f instanceof Array) {
    this._array = true;
    this._field = f[0];
  }
  this._compiled = _.template(this._field);
}

Field.prototype._produce = function () {
  return this._compiled({});
};

Field.prototype.emit = function () {
  if (this._array) {
    var data = [];
    for (var i = _.random(1, 3); i > 0; i--) {
      data.push(this._produce());
    }
    return data;
  } else {
    return this._produce();
  }
};

var raw = { field: 'string', obj: { field: 'string' }, ar: ['string'], arobj: [{ field: 'string' }]}

module.exports = Schema;
