/**
 * Common tools for test
 */
var chance = require('chance').Chance();
var datasets = require('../');
var async = require('async');
var es = require('event-stream');
var fs = require('fs');
var path = require('path');

module.exports.regex = {
  phone: /(\(\d{3}\)\s*)(\d{3})-(\d{4})/,
  exp: /(\d{2})\/(\d{4})/
};

module.exports.generate = function (schema, opts, fn) {
  if(Object.prototype.toString.call(schema) === '[object Object]'){
    return datasets(opts.size, schema).pipe(es.writeArray(fn));
  }

  fs.createReadStream(schema)
    .pipe(datasets(opts.size))
    .pipe(es.writeArray(fn));
};

module.exports.resolveSchemaPath = function (name) {
  return path.resolve('.', 'examples', name);
};

module.exports.sampleAndStrip = function (array, count, fn) {
  var sample = chance.pick(array, count);
  async.each(sample, function (item, callback) {
    item._id = undefined;
    callback();
  }, function (err) {
    if (err)
      throw err;
    fn(sample);
  });
};
