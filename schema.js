var debug = require('debug')('dataset:schema');
var mongo = require('mongodb');
var _ = require('underscore');

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// random data
var chance = require('chance').Chance();
var faker = require('faker');

function Schema (sc) {
  if (!(this instanceof Schema)) return new Schema(sc);
  this._document = new Document(sc, this);
  this._context = this._document._context; // useful?
  this._state = {
    counter: []
  };
}

Schema.prototype.getSchema = function () {
  return this;
}

Schema.prototype.emit = function () {
  return this._document.emit();
};

// doc must be an object or an array of object
function Document (document, parent) {
  if (!(this instanceof Document)) return new Document(document, parent);
  this._parent = parent;
  this._context = new Context(this);
  this._array = document instanceof Array;
  this._children = {};
  var doc = this._array ? document[0] : document;
  for (var name in doc) {
    var data = doc[name];
    if (typeof data === 'string' ||
       (data instanceof Array && typeof data[0] === 'string')) {
      this._children[name] = new Field(data, this);
    } else {
      this._children[name] = new Document(data, this);
    }
  }
}

Document.prototype.getSchema = function () {
  return this._parent.getSchema();
}

Document.prototype._produce = function () {
  var data = {};
  for (var name in this._children) {
    data[name] = this._children[name].emit();
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
function Field (field, parent) {
  if (!(this instanceof Field)) return new Field(field, parent);
  this._parent = parent;
  this._array = false;
  this._field = field;
  if (field instanceof Array) {
    this._array = true;
    this._field = field[0];
  }
  this._compiled = _.template(this._field);
}

Field.prototype.getSchema = function () {
  return this._parent.getSchema();
}

Field.prototype._produce = function () {
  this._parent._context._temp = {};
  var res = this._compiled(this._parent._context);
  var alt = this._parent._context._temp.override;
  return (typeof alt === 'undefined') ? res : alt;
};

Field.prototype.emit = function () {
  if (this._array) {
    var data = [];
    for (var i = _.random(1, 3); i > 0; i--) {
      data.push(this._produce());
    }
    return data;
  }
  return this._produce();
};

// object that will pass into _.template
function Context (host) {
  if (!(this instanceof Context)) return new Context(host);
  // security issues, what if users call _host?
  this._host = host;
  this._temp = {
    override: undefined // if present, used to override the template output
  };
  this._state = {
    // counter: [] // move to global state
  };
  this.util = {
    sample: _.sample
  };

  // need to add security feature
  this.chance = chance;
  this.faker = faker;
}

Context.prototype.counter = function (id, start, step) {
  id = id || 0; // though id=0 is false, does not matter
  if (typeof this._host.getSchema()._state.counter[id] === 'undefined') {
    return (this._host.getSchema()._state.counter[id] = start || 0);
  }
  return (this._host.getSchema()._state.counter[id] += (step || 1));
};

// all supported data types
Context.prototype.Double = function (i) {
  this._temp.override = Number(i);
}
Context.prototype.Boolean = function (b) {
  this._temp.override = Boolean(b);
}
Context.prototype.String = function (s) {
  this._temp.override = String(s);
}
Context.prototype.Date = function (d) {
  this._temp.override = new Date(d);
};
Context.prototype.NumberLong = function (i) {
  this._temp.override = new mongo.Long(i);
}
Context.prototype.MinKey = function () {
  this._temp.override = new mongo.MinKey();
}
Context.prototype.MaxKey = function () {
  this._temp.override = new mongo.MaxKey();
}
Context.prototype.Timestamp = function () {
  this._temp.override = new mongo.Timestamp();
}
Context.prototype.ObjectID = function (i) {
  this._temp.override = new mongo.ObjectID(i);
}

module.exports = Schema;
