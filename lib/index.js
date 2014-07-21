var Generator = require('./generator');

module.exports.createGeneratorStream = function (opts) {
  return new Generator(opts);
};
