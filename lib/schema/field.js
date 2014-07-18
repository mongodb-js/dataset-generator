var debug = require('debug')('dataset:schema');
var _ = require('underscore');
var util = require('util');
var stream = require('stream');

var helpers = require('./helpers');

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// field must be string or an array of string
function Field (field, parent) {
  if (!(this instanceof Field)) return new Field(field, parent);
  debug('building field', field);
  stream.Readable.call(this, {objectMode: true});
  this._parent = parent;
  this._prevVal = undefined;
  this._currVal = undefined;
  this._arrayConfig = helpers.demuxArray(field);
  this._field = this._arrayConfig.isArray ? _.last(field) : field;

  if (typeof this._field !== 'string') {
    var self = this;
    this._compiled = function () { return self._field; };
  } else {
    this._compiled = _.template(this._field);
  }
}
util.inherits(Field, stream.Readable);

Field.prototype.getRoot = function () {
  return this._parent.getRoot();
};

Field.prototype._clean = function () {
  this._prevVal = this._currVal;
  this._currVal = undefined;
};
Field.prototype._produce = function () {
  this._parent._context._state = {};
  var res = this._compiled.call(this._parent._currVal, this._parent._context);
  var alt = this._parent._context._state.override;
  return (typeof alt === 'undefined') ? res : alt;
};

Field.prototype.next = function () {
  if (typeof this._currVal !== 'undefined') return this._currVal;
  var data;
  if (this._arrayConfig.isArray) {
    data = [];
    for (var i = this._arrayConfig.num(); i > 0; i--) {
      data.push(this._produce());
    }
  } else if (typeof this._field !== 'string') {
    data = this._field;
  } else {
    data = this._produce();
  }
  return (this._currVal = data);
};

Field.prototype._read = function (n) {
  this.push(this.next());
};

module.exports = Field;
