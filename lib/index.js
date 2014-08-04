var Generator = require('./generator'),
  EJSON = require('mongodb-extended-json'),
  es = require('event-stream'),
  stream = require('stream');

/* experimental interface
 * @param a single object (or an array of objects) that contain:
 *   + (optional) name, version, and other identification of the package
 *   + (optional) mongodb configuration, i.e. collection, index
 *   + datasets template schemas (each with full set of schema-specific config)
 * @example
 * { name: 'test',
     version: 'v0.0.0',
     mongodb: {
       collections: [ { name: 'datasets',
                        source: 's1',
                        index: ... } ],
       ...
     },
     schemas: [ { _$meta: {
                    name: 's1',
                    size: 100,
                    dependency: [],
                    ...
                  },
                  ...
                } ]
   }
 */
module.exports = function(size, schema) {
  var dest = new Generator({size: size}),
    src = new stream.Readable({objectMode: true});

  src.push(schema);
  src.push(null);
  return src.pipe(dest);
};

module.exports.stringify = function(opts) {
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

module.exports.createGeneratorStream = function(opts) {
  return new Generator(opts);
};
