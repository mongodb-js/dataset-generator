var Generator = require('./generator');
var Populator = require('./populator');

module.exports.createGeneratorStream = function (opts) {
  return new Generator(opts);
};

module.exports.createPopulatorStream = function (opts) {
  return new Populator(opts);
};
