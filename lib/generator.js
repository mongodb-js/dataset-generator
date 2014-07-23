var debug = require('debug')('mongodb-datasets:generator'),
  Transform = require('stream').Transform,
  util = require('util'),
  Schema = require('./schema'),
  EJSON = require('mongodb-extended-json');

function Generator(options) {
  if(!(this instanceof Generator)) return new Generator(options);

  Transform.call(this, {objectMode: true});
  this.size = options.size || 1;
  this.chunks = [];
}
util.inherits(Generator, Transform);

Generator.prototype._transform = function (chunk, encoding, done) {
  if (encoding === 'buffer') {
    this.chunks.push(chunk);
  }
  else {
    debug('_transform', chunk, encoding);
    this._rawSchema = chunk;
  }
  done();
};

Generator.prototype._flush = function(callback){
  var data = undefined;
  if(this.chunks.length > 0) data = EJSON.parse(Buffer.concat(this.chunks));

  var schema = new Schema(data, this.size);
  this.emit('schema', schema);
  for (var i = 0; i < this.size; i++){
    this.push(schema.next());
  }
  callback();
};

module.exports = Generator;
