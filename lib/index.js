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
  var i = 0;
  return es.through(function(data){
    var s = EJSON.stringify(data, null, opts.spaces);
    var msg = i === 0 ? '[' + s : ',\n' + s;
    i++;
    this.emit('data', msg);
  }, function() {
    this.emit('data', ']\n');
    this.emit('end');
  });
};

module.exports.createGeneratorStream = function(opts){
  return new Generator(opts);
};
