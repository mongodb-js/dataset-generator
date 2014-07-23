var Generator = require('./generator'),
  EJSON = require('mongodb-extended-json'),
  es = require('event-stream'),
  debug = require('debug')('mongodb-datasets');


function fauxReader(opts){
  var sent = false;
  return es.readable(function(count, next){
    if(sent) return this.emit('end');
    this.emit('data', opts.schema);
    sent = true;
    debug('emitted schema', opts.schema);
    next();
  });
}

module.exports = function(n, schema){
  return module.exports.createGeneratorStream({n: n, schema: schema});
};

module.exports.createGeneratorStream = function(opts){
  var gen = new Generator(opts);
  if(!opts.schema) return gen;
  return fauxReader(opts).pipe(gen);
};

module.exports.stringify = function(opts){
  opts = opts || {};
  opts.spaces = opts.spaces || undefined;

  return es.map(function(data, next){
    next(null, EJSON.stringify(data, null, opts.spaces));
  });
};
