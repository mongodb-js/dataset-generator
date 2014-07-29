var debug = require('debug')('mongodb-datasets:schema:array');
var util = require('util');
var helpers = require('./helpers');
var Entry = require('./entry');
var _ = require('underscore');

// doc must be an object or an array of object
util.inherits(ArrayField, Entry);
function ArrayField (array, name, parent) {
  if (!(this instanceof ArrayField)) return new ArrayField(array, name, parent);
  debug('array <%s> being built', name);
  Entry.call(this, array, name, parent);
  this._context = parent._context;
  this._this = parent._this;
  this._currVal = {};
  // this._currVal = parent._currVal; // ArrayField's parent must be Document
  // Object.defineProperty(this._currVal, '_$parent', {
  //   get: function () {
  //     return parent._currVal;
  //   }
  // });

  // this._children = {};
  // for (var childName in this._content) {
  //   this._children[childName] =
  //     helpers.build(this._content[childName], childName, this);
  //   (function (method) {
  //     var child = this._children[method];
  //     Object.defineProperty(this._currVal, method, {
  //       enumerable: true,
  //       get: function () {
  //         if (child._currVal === undefined)
  //           return child.next();
  //         return child._currVal; // doc's currval never empty
  //       }
  //     });
  //   }).call(this, childName);
  // }

  this._children = [];
  this._content.forEach(function (child, index) {
    this._children.push(helpers.build(child, index, this));
    (function (method) {
      var child = this._children[method];
      Object.defineProperty(this._currVal, method, {
        enumerable: true,
        get: function () {
          if (child._currVal === undefined)
            return child.next();
          return child._currVal; // doc's currval never empty
        }
      });
    }).call(this, index);
  }, this);

  debug('array <%s> build complete', name);
}

ArrayField.prototype.next = function () {
  this._clean();
  var data = [];
  this._children.forEach(function (child, index) {
    debug('array <%s> calls child <%s>', this._name, index);
    var res = child.next();
    if (this._context._state.display ||
       (!child._hidden && this._context._state.display === undefined))
      data[index] = res;
    this._context._reset(true);
  }, this);
  return data;
};

ArrayField.prototype._clean = function () {
  this._children.forEach(function (child) {
    child._clean();
  });
};

module.exports = ArrayField;
