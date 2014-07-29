var _ = require('underscore'),
  Document = require('./document'),
  Field = require('./field'),
  ArrayField = require('./array'),
  Joi = require('joi');

// module.exports.build_old = function (content, name, parent) {
//   // this chunk need to integrate with demuxArray
//   if (typeof content === 'object' &&
//      (!Array.isArray(content) ||
//      (typeof _.last(content) === 'object') &&
//      (!Array.isArray(_.last(content)))))
//     return new Document(content, name, parent);
//   else
//     return new Field(content, name, parent);
// };

module.exports.build = function (content, name, parent) {
  if (Array.isArray(content))
    return new ArrayField(content, name, parent);
  if (typeof content === 'object')
    return new Document(content, name, parent);
  return new Field(content, name, parent);
};

var SCHEMAS = {
  name: Joi.any(),
  field: Joi.any(),
  meta: Joi.any()
};

module.exports.validate = function (schema) {
  Joi.validate(schema, SCHEMAS.field, function (err) {
    if (err) throw err;
  });
};

// [ { a: 1 }, 'b', { c: 1 }, { c: false } ]
// => { a: 1, b: true }
module.exports.mix = function (args) {
  var input = arguments.length > 1 ? arguments : args;
  var opts = {};
  for (var i = 0; i < input.length; i++ ) {
    var item = input[i];
    if (typeof item === 'object') {
      opts = _.extend(opts, item);
      opts = _.omit(opts, _.pairs(item).map(function (e) {
        return e[1] === false ? e[0] : undefined;
      }));
    } else {
      opts[item] = true;
    }
  }
  return opts;
};
