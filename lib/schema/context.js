var _ = require('underscore');
var debug = require('debug')('mongodb-datasets:schema:context');
var bson = require('bson');
var chance = require('chance').Chance();
var faker = require('faker');

/**
 * Context object is used as context in function _.template
 * @class
 * @public
 * @param {!Document} host The Document this Context is used
 * @since 0.1.0
 */
function Context (host) {
  if (!(this instanceof Context)) return new Context(host);

  // need to add security feature
  /**
   * Chance.js library
   * @method
   * @public
   * @since 0.1.0
   * @deprecated since 0.2.0
   */
  this.chance = chance;
  this.faker = faker;

  // internals
  this._state = {
    display: undefined, // when true, the current field will not be visible
    override: undefined // if present, used to override the template output
  };
  this.util = {
    sample: _.sample
  };

  // utility methods
  this.counter = function (id, start, step) {
    id = id || 0; // though id=0 is false, does not matter
    debug('counter called id=%d', id);
    var counter = host._schema._state.counter; //pointer
    if (typeof counter[id] === 'undefined') {
      return (counter[id] = start || 0);
    }
    return (counter[id] += (step || 1));
  };

  /**
   * Create and return a reference to a new Document of Schema named schema
   * @public
   * @param {!string} schema The name of the target Schema
   * @param {Object} env Collection of fields overriding schema's defaults
   * @return {Document} The new Document created by Schema with name schema
   * @since 0.3.0
   */
  this.REF = function (schema, env) {
    return host._schema._dispatcher.spawnSchema(schema, env);
  };

  Object.defineProperty(this, '_$size', {
    get: function () {
      return host._schema.size;
    }
  });

  Object.defineProperty(this, '_$index', {
    get: function () {
      return host._schema._state.index;
    }
  });

  Object.defineProperty(this, '_$root', {
    get: function () {
      return host._schema._document._currVal;
    }
  });

}

// internal util
Context.prototype._reset = function (hard) {
  this._state.override = undefined;
  if (hard) {
    this._state.display = undefined;
  }
};

// user util
Context.prototype.hide = function (pred) {
  if (pred) this._state.display = false;
};
Context.prototype.show = function (pred) {
  if (pred) this._state.display = true;
};

// convenient
Context.prototype.coordinates = function (options) {
  var opts = options || {};
  var lat = chance.latitude({fixed: opts.fixed});
  var lng = chance.longitude({fixed: opts.fixed});
  return [lat, lng];
};

// constructors of different types
Context.prototype.Object = function (o) {
  this._state.override = Object(o);
};
Context.prototype.Number = function (i) {
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
