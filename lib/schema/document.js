var debug = require('debug')('dataset:schema');
var _ = require('underscore');
var util = require('util');
var helpers = require('./helpers');
var Entry = require('./entry');
var Context = require('./context');

// doc must be an object or an array of object
util.inherits(Document, Entry);
function Document (document, name, parent) {
  if (!(this instanceof Document)) return new Document(document, name, parent);
  Entry.call(this, document, name, parent);

  this._context = new Context(this);
  this._currVal = {}; // 'this' object in evaluating user expressions
  Object.defineProperty(this._currVal, '_$parent', {
    get: function () {
      return parent._currVal;
    }
  });

  this._children = {};
  for (var childName in this._content) {
    this._children[childName] =
      helpers.build(this._content[childName], childName, this);
    (function (method) {
      var child = this._children[method];
      Object.defineProperty(this._currVal, method, {
        enumerable: true,
        get: function () {
          return child.next();
        }
      });
    }).call(this, childName);
  }
}

Document.prototype._root = function () {
  return this._parent._root();
};

Document.prototype.next = function () {
  if (this._arrayConfig.isArray) {
    var data = [];
    for (var i = this._arrayConfig.num(); i > 0; i--) {
      data.push(this._produce());
    }
    return data;
  } else {
    return this._produce();
  }
};

Document.prototype._produce = function () {
  this._clean();
  var data = {};
  for (var name in this._children) {
    var child = this._children[name];
    if (!child._hidden)
      data[name] = child.next();
  }
  return data;
};

Document.prototype._clean = function () {
  for (var child in this._children) {
    this._children[child]._clean();
  }
};

module.exports = Document;
