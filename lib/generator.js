var debug = require('debug')('mongodb-datasets:generator'),
  Transform = require('stream').Transform,
  util = require('util'),
  Schema = require('./schema'),
  EJSON = require('mongodb-extended-json'),
  Dispatcher = require('./dispatcher'),
  _ = require('underscore');

function Generator(opts) {
  if(!(this instanceof Generator)) return new Generator(opts);

  debug('Generator commissioned');
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
    debug('Generator finished receiving config file');
  }
  var parsed = decode(this.data);
  this.emit('header', parsed.header);
  this.emit('mongodb', parsed.mongodb);

  if (parsed.legacy) {
    debug('USING LEGACY MODE');
    var schema = new Schema(this.data, this.size);
    this.emit('schema', schema);
    for (var i = 0; i < this.size; i++){
      this.push(schema.next());
    }
    return callback();
  }

  var dispatcher = new Dispatcher(parsed.schemas);
  var data = dispatcher.next();
  while (data !== null) {
    this.push(data);
    data = dispatcher.next();
  }
  callback();
};

function decode (input) {
  // a very simplistic approach, should be more complex
  if (input.schemas) {
    return {
      header: _.omit(input, 'schemas', 'mongodb'),
      mongodb: input.mongodb,
      schemas: input.schemas
    };
  } else { //legacy
    return {
      legacy: true,
      header: { name: 'task' + Date.now() },
      mongodb: 'not configured',
      schemas: input
    };
  }
}

module.exports = Generator;
module.exports.decode = decode;
