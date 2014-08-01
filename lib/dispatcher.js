var debug = require('debug')('mongodb-datasets:dispatcher'),
  Schema = require('./schema'),
  _ = require('underscore');

function Dispatcher(schemas) {
  if(!(this instanceof Dispatcher)) return new Dispatcher(schemas);

  this.schemas = {};
  schemas.forEach(function (schema) {
    var s = new Schema (schema, 0, this);
    this.schemas[s.name] = s;
  }, this);
}

Dispatcher.prototype.next = function () {

};

Dispatcher.prototype.hasNext = function () {

};

module.exports = Dispatcher;
