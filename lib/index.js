var Generator = require('./generator'),
  EJSON = require('mongodb-extended-json'),
  es = require('event-stream'),
  debug = require('debug')('mongodb-datasets');


function fauxReader(schema){
  var sent = false;
  return es.readable(function(count, next){
    if(sent) return this.emit('end');
    this.emit('data', schema);
    sent = true;
    debug('emitted schema', schema);
    next();
  });
}

module.exports = function(size, schema){
  return module.exports.createGeneratorStream({size: size, schema: schema});
};

module.exports.createGeneratorStream = function(opts){
  if(opts.schema){
    var schema = opts.schema;
    delete opts.schema;
    var gen = new Generator(opts);
    fauxReader(schema).pipe(gen);
    return gen;
  }
  else {
    return new Generator(opts);
  }
};

module.exports.stringify = function(opts){
  opts = opts || {};
  opts.spaces = opts.spaces || undefined;

  return es.map(function(data, next){
    next(null, EJSON.stringify(data, null, opts.spaces));
  });
};
