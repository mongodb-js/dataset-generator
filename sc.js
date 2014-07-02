var Chance = require('chance');
var debug = require('debug')('dataset:schema');
var _ = require('underscore');

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

function Schema (sc) {
  if (!(this instanceof Schema)) return new Schema(sc);
  this._schema = new Document(sc, this);
  this._context = {
    chance: new Chance()
  };
}

Schema.prototype.emit = function () {
  return this._schema.emit();
};

// doc must be an object or an array of object
function Document (document, schema) {
  if (!(this instanceof Document)) return new Document(document, schema);

  this._schema = schema;
  this._array = document instanceof Array;
  this._document = {};
  var doc = this._array ? document[0] : document;
  for (var name in doc) {
    var data = doc[name];
    if (typeof data === 'string' ||
       (data instanceof Array && typeof data[0] === 'string')) {
      this._document[name] = new Field(data, schema);
    } else {
      this._document[name] = new Document(data, schema);
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

// field must be string or an array of string
function Field (field, schema) {
  if (!(this instanceof Field)) return new Field(field, schema);

  this._schema = schema;
  this._array = false;
  this._field = field;
  if (field instanceof Array) {
    this._array = true;
    this._field = field[0];
  }
  this._compiled = _.template(this._field);
}

Field.prototype._produce = function () {
  return this._compiled(this._schema._context);
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

module.exports = Schema;
