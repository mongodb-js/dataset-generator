var debug = require('debug')('dataset:schema');
var _ = require('underscore');
var bson = require('bson');
var util = require('util');
var stream = require('stream');

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// random data
var chance = require('chance').Chance();
var faker = require('faker');

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

// doc must be an object or an array of object
function Document (document, parent) {
  if (!(this instanceof Document)) return new Document(document, parent);
  stream.Readable.call(this, {objectMode: true});
  this._parent = parent;
  this._context = new Context(this);
  this._array = Array.isArray(document);
  this._currVal = {};
  this._children = {};
  var doc = this._array ? document[0] : document;

  for (var name in doc) {
    var data = doc[name];
    if ((Array.isArray(data) && typeof data[0] === 'object') ||
        (typeof data === 'object' && !Array.isArray(data))) {
       this._children[name] = new Document(data, this);
    } else {
       this._children[name] = new Field(data, this);
    }
    (function (method) {
      var child = this._children[method];
      Object.defineProperty(this._currVal, method, {
        enumerable: true,
        get: function () {
          if (typeof child._currVal === 'undefined') {
            return child.next();
          }
          return child._currVal;
        }
      });
    }).call(this, name);
  }
}
util.inherits(Document, stream.Readable);

Document.prototype.getRoot = function () {
  return this._parent.getRoot();
};

Document.prototype._produce = function () {
  this._clean();
  var data = {};
  for (var name in this._children) {
    data[name] = this._children[name].next();
  }
  return data;
};

Document.prototype.next = function () {
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

Document.prototype._clean = function () {
  for (var child in this._children) {
    this._children[child]._clean();
  }
};

Document.prototype._read = function (n) {
  this.push(this.next());
};

// field must be string or an array of string
function Field (field, parent) {
  if (!(this instanceof Field)) return new Field(field, parent);
  debug('building field', field);
  stream.Readable.call(this, {objectMode: true});
  this._parent = parent;
  this._array = false;
  this._field = field;
  this._passVal = undefined;
  this._currVal = undefined;
  if (Array.isArray(field)) {
    this._array = true;
    this._field = field[0];
  }
  this._compiled = _.template(this._field);
}
util.inherits(Field, stream.Readable);

Field.prototype.getRoot = function () {
  return this._parent.getRoot();
};

Field.prototype._clean = function () {
  this._currVal = undefined;
};
Field.prototype._produce = function () {
  this._parent._context._temp = {};
  var res = this._compiled.call(this._parent._currVal, this._parent._context);
  var alt = this._parent._context._temp.override;
  return (typeof alt === 'undefined') ? res : alt;
};

Field.prototype.next = function () {
  if (typeof this._currVal !== 'undefined') return this._currVal;
  var data;
  if (this._array) {
    data = [];
    for (var i = _.random(1, 3); i > 0; i--) {
      data.push(this._produce());
    }
  } else if (typeof this._field !== 'string') {
    data = this._field;
  } else {
    data = this._produce();
  }
  return (this._currVal = data);
};

Document.prototype._read = function (n) {
  this.push(this.next());
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
    // counter: []
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
  var counter = this._host.getRoot()._state.counter; //pointer
  if (typeof counter[id] === 'undefined') {
    return (counter[id] = start || 0);
  }
  return (counter[id] += (step || 1));
};

// all supported data types
Context.prototype.Double = function (i) {
  this._temp.override = Number(i);
};
Context.prototype.Boolean = function (b) {
  this._temp.override = Boolean(b);
};
Context.prototype.String = function (s) {
  this._temp.override = String(s);
};
Context.prototype.Date = function (d) {
  this._temp.override = new Date(d);
};
Context.prototype.NumberLong = function (i) {
  this._temp.override = new bson.Long(i);
};
Context.prototype.MinKey = function () {
  this._temp.override = new bson.MinKey();
};
Context.prototype.MaxKey = function () {
  this._temp.override = new bson.MaxKey();
};
Context.prototype.Timestamp = function () {
  this._temp.override = new bson.Timestamp();
};
Context.prototype.ObjectID = function (i) {
  this._temp.override = new bson.ObjectId(i);
};

module.exports = Schema;
