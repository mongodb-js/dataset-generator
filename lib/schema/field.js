var debug = require('debug')('mognodb-datasets:schema');
var util = require('util');
var _ = require('underscore');
var Entry = require('./entry');

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// field must be string or an array of string
util.inherits(Field, Entry);
function Field (field, name, parent) {
  if (!(this instanceof Field)) return new Field(field, name, parent);

  debug('building field', field, name, parent);
  Entry.call(this, field, name, parent);

  // should support array of normal content
  if (typeof this._content !== 'string') {
    this._compiled = function () {
      return this._content;
    }.bind(this);
  } else {
    this._compiled = _.template(this._content);
  }
}

Field.prototype._root = function () {
  return this._parent._root();
};

Field.prototype.next = function () {
  if (typeof this._currVal !== 'undefined') return this._currVal;
  var data;
  if (this._arrayConfig.isArray) {
    data = [];
    for (var i = this._arrayConfig.num(); i > 0; i--) {
      data.push(this._produce());
    }
  } else {
    data = this._produce();
  }
  return (this._currVal = data);
};

Field.prototype._produce = function () {
  if(!this._parent._context){
    throw new TypeError('Parent has no context!');
  }
  this._parent._context._reset();
  var res = this._compiled.call(this._parent._currVal, this._parent._context);
  var alt = this._parent._context._state.override;
  return (typeof alt === 'undefined') ? res : alt;
};

Field.prototype._clean = function () {
  this._prevVal = this._currVal;
  this._currVal = undefined;
};

module.exports = Field;
