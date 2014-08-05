var debug = require('debug')('mongodb-datasets:dispatcher'),
  Schema = require('./schema');

function Dispatcher(schemas) {
  if(!(this instanceof Dispatcher)) return new Dispatcher(schemas);

  debug('=====Dispatcher=====');
  this.names = [];
  this.schemas = {};
  schemas.forEach(function (schema) {
    var s = new Schema (schema, 0, this);
    this.names.push(s.name);
    this.schemas[s.name] = s;
  }, this);
  this.actives = this.names.slice();
  this.count = 0;
}

Dispatcher.prototype.next = function () {
  if (this.actives.length === 0) {
    var rtn = [];
    this.names.forEach(function (name) {
      var dump = this.schemas[name].dump();
      if (dump.length > 0)
        rtn.push({
          schema: name,
          bulk: true,
          data: dump
        });
    }, this);
    if (rtn.length === 0) return null;
    return rtn;
  }
  var s = this.schemas[this.actives[0]];
  if (!s.hasNext()) {
    this.actives = this.actives.slice(1);
    return this.next();
  }
  return {
    schema: s.name,
    bulk: false,
    data: s.next()
  };
};

Dispatcher.prototype.spawnSchema = function (name, env) {
  if (Object.prototype.hasOwnProperty.call(this.schemas, name)) {
    return this.schemas[name].stock(env);
  }
};

module.exports = Dispatcher;
