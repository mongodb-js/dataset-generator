/* schema.js */
var chanceBuilder = require('./chanceBuilder');

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
  this.chance = chanceBuilder(s);
}

module.exports = Schema;
