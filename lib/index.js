var Generator = require('./generator'),
  EJSON = require('mongodb-extended-json'),
  es = require('event-stream'),
  stream = require('stream');

module.exports = function(size, schema){
  var dest = new Generator({size: size}),
    src = new stream.Readable({objectMode: true});

  src.push(schema);
  src.push(null);
  return src.pipe(dest);
};

module.exports.stringify = function(opts){
  opts = opts || {};
  opts.spaces = opts.spaces || undefined;

  return es.map(function(data, next){
    next(null, EJSON.stringify(data, null, opts.spaces));
  });
};

module.exports.createGeneratorStream = function(opts){
  return new Generator(opts);
};
