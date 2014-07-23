var debug = require('debug')('mongodb-datasets:generator'),
  Transform = require('stream').Transform,
  util = require('util'),
  Schema = require('./schema'),
  EJSON = require('mongodb-extended-json');

function Generator(opts) {
  if(!(this instanceof Generator)) return new Generator(opts);

  Transform.call(this, {objectMode: true});
  this.size = opts.size || 1;
  this.chunks = [];
  this.data = null;
}
util.inherits(Generator, Transform);

Generator.prototype._transform = function (chunk, encoding, done) {
  if(['buffer', 'utf8'].indexOf(encoding) === -1){
    return done(new Error('Dont understand encoding `'+encoding+'`'));
  }
  if(Buffer.isBuffer(chunk)){
    this.chunks.push(chunk);
  }
  else {
    this.data = chunk;
  }
  done();
};

Generator.prototype._flush = function(callback){
  if(!this.data){
    if(this.chunks.length === 0){
      return debug('nothing to transform. noop to allow actual error to bubble');
    }
    this.data = EJSON.parse(Buffer.concat(this.chunks));
  }
  var schema = new Schema(this.data, this.size);
  this.emit('schema', schema);
  for (var i = 0; i < this.size; i++){
    this.push(schema.next());
  }
  callback();
};

module.exports = Generator;
