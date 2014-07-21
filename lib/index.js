var debug = require('debug')('dataset:index');
var helpers = require('./helpers');
var Generator = require('./generator');
var Populator = require('./populator');

module.exports.DEFAULT_OPTIONS = helpers.DEFAULT_OPTIONS;

module.exports.createGeneratorStream = function (opts) {
  return new Generator(opts);
};

module.exports.createPopulatorStream = function (opts) {
  return new Populator(opts);
};
