/* schema.js */
var Chance = require('chance');
var debug = require('debug')('dataset:schema');

/**
 * A representation of schema specified by user that records the name and
 * the type of random data for each field. The type of random data must be
 * supported by Chance.js. For example, {user_email: 'email'} means
 * that the data corresponding to the field 'user_email' is supplied by
 * chance.email()
 */


/**
 * To-do's
 * embedded schema, e.g. {user: {id: 'number', user_email: 'email'}}
 * complex random data, e.g. {products: 'number-text'} should
 * generate things like '3-foo', '234-bar'
 * reference relationship between schema, e.g. 'manager_id' in Employee
 * collection should correspond to 'id' in Manager collection
 */

function Schema (s) {
  if (!(this instanceof Schema)) return new Schema(s);

  this._schema = s;
  this.chance = buildMixin(s);
}

/**
 * A utility method to build the mixin needed for the input schema
 */
var chance;
function buildMixin (schema) {
  debug('Start building schema -> %j', schema);
  chance = new Chance();
  buildMixinHelper(schema, 0);
  return chance;
}

function buildMixinHelper (schema, id) {
  debug('id=%d starts building, schema -> %j', id, schema);
  var treeSize = 1; // count itself
  var flatSchema = {};
  var field, type;
  var simplifyField = function (type) {
    if (typeof type !== 'object') {
      return type;
    } else {
      var childId = id + treeSize;
      treeSize += buildMixinHelper(type, childId);
      return '_' + childId;
    }
  };
  for (field in schema) {
    type = schema[field];
    if (type instanceof Array) {
      flatSchema[field] = [simplifyField(type[0])];
    } else {
      flatSchema[field] = simplifyField(type);
    }
  }
  debug('id=%d, flatSchema -> %j', id, flatSchema);
  // add new mixin corresponding to schema
  var mixin = {};
  mixin['_' + id] = function () {
    var o = {};
    var field, type;
    for (field in flatSchema) {
      type = flatSchema[field];
      // calling chance must happen inside this function
      if (type instanceof Array) {
        o[field] = [];
        for (var i = 0; i < chance.d6(); i++) {
          o[field].push(chance[type]());
        }
      } else {
        o[field] = chance[type]();
      }
    }
    return o;
  };
  chance.mixin(mixin);
  return treeSize;
}

module.exports = Schema;
