var Transform = require('stream').Transform;
var util = require('util');
var Schema = require('./schema');

function Generator(options) {
  if (!(this instanceof Generator))
    return new Generator(options);

  Transform.call(this, {objectMode: true});
  this._size = options.size || 1;
  this._counter = 0;
  this._schemaChunks = [];
}
util.inherits(Generator, Transform);

Generator.prototype._transform = function (chunk, encoding, done) {
  this._schemaChunks.push(chunk);
  done();
};

Generator.prototype._flush = function (callback) {
  console.log('flush');
  var schema = new Schema(JSON.parse(Buffer.concat(this._schemaChunks)));
  // md.populate(this._options, function () {
  //   console.log('done');
  //   callback();
  // });
  for (var i = 0; i < this._size; i++) {
    this.push(JSON.stringify(schema.next()));
  }
  callback();
};

// var fs = require('fs'); md = require('./'); fs.createReadStream('./examples/me_in_a_nutshell.json').pipe(md.createGeneratorStream({size: 1})).pipe(fs.createWriteStream('out'));

module.exports = Generator;
