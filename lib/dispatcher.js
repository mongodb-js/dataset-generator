var debug = require('debug')('mongodb-datasets:dispatcher'),
  Schema = require('./schema'),
  _ = require('underscore');

function Dispatcher(schemas) {
  if(!(this instanceof Dispatcher)) return new Dispatcher(schemas);

  this.actives = [];
  this.allSchemas = {};
  schemas.forEach(function (schema) {
    var s = new Schema (schema, 0, this);
    this.actives.push(s.name);
    this.allSchemas[s.name] = s;
  }, this);
  this.count = 0;
}

Dispatcher.prototype.next = function () {
  if (!this.hasNext()) return;
  var s = this.allSchemas[this.actives[0]];
  if (!s.hasNext()) {
    this.actives = this.actives.slice(1);
    return this.next();
  }
  return s.next();
};

Dispatcher.prototype.hasNext = function () {
  return this.actives.length > 0;
};

module.exports = Dispatcher;
