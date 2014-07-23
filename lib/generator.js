var debug = require('debug')('mongodb-datasets:generator'),
  Transform = require('stream').Transform,
  util = require('util'),
  Schema = require('./schema'),
  EJSON = require('mongodb-extended-json');

util.inherits(Generator, Transform);
function Generator(options) {
  if(!(this instanceof Generator)) return new Generator(options);

  Transform.call(this, {objectMode: true});
  this._size = options.size || 1;
  this._schemaChunks = [];
  debug('generator with ' + this._size + ' pending docs');
}

Generator.prototype._transform = function (chunk, encoding, done) {
  if (encoding === 'buffer') {
    this._schemaChunks.push(chunk);
  } else {
    debug('_transform', chunk, encoding);
    this._rawSchema = chunk;
  }
  done();
};

Generator.prototype._flush = function(callback){
  if(Object.prototype.toString.call(this.rawSchema) === '[object String]'){
    this._rawSchema = EJSON.parse(Buffer.concat(this._schemaChunks));
  }

  var schema = new Schema(this._rawSchema, this._size);
  debug('schema received');
  this.emit('schema', schema);
  for (var i = 0; i < this._size; i++) {
    debug('emitting ' + (i+1) + 'th document');
    this.push(schema.next());
  }
  callback();
};

module.exports = Generator;
