var Chance = require('chance');
var debug = require('debug')('dataset:schema');
var _ = require('underscore');
var chance;
_.templateSettings = {
  variable: 'data',
  interpolate: /\{\{(.+?)\}\}/g
};

function Schema (sc) {
  if (!(this instanceof Schema)) return new Schema(sc);
  this._schema = new Document(sc);
}

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

// f must be string or an array of string
function Field (f) {
  if (!(this instanceof Field)) return new Field(f);

  this._array = false;
  this._field = f;
  if (f instanceof Array) {
    this._array = true;
    this._field = f[0];
  }
}

module.exports = Schema;
