var debug = require('debug')('dataset:schema');
var _ = require('underscore');
var bson = require('bson');
var chance = require('chance').Chance();
var faker = require('faker');

// object that will pass into _.template
function Context (host) {
  if (!(this instanceof Context)) return new Context(host);

  this._state = {
    override: undefined // if present, used to override the template output
  };
  this.util = {
    sample: _.sample
  };

  // need to add security feature
  this.chance = chance;
  this.faker = faker;

  // utility methods
  // this._host = host;
  this.counter = function (id, start, step) {
    id = id || 0; // though id=0 is false, does not matter
    var counter = host._root()._state.counter; //pointer
    if (typeof counter[id] === 'undefined') {
      return (counter[id] = start || 0);
    }
    return (counter[id] += (step || 1));
  };

}

// all supported data types
Context.prototype.Double = function (i) {
  this._state.override = Number(i);
};
Context.prototype.Boolean = function (b) {
  this._state.override = Boolean(b);
};
Context.prototype.String = function (s) {
  this._state.override = String(s);
};
Context.prototype.Date = function (d) {
  this._state.override = new Date(d);
};
Context.prototype.NumberLong = function (i) {
  this._state.override = new bson.Long(i);
};
Context.prototype.MinKey = function () {
  this._state.override = new bson.MinKey();
};
Context.prototype.MaxKey = function () {
  this._state.override = new bson.MaxKey();
};
Context.prototype.Timestamp = function () {
  this._state.override = new bson.Timestamp();
};
Context.prototype.ObjectID = function (i) {
  this._state.override = new bson.ObjectId(i);
};

module.exports = Context;
