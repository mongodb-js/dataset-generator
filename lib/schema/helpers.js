var _ = require('underscore'),
  Document = require('./document'),
  Field = require('./field'),
  Joi = require('joi');

module.exports.build = function (content, name, parent) {
  // this chunk need to integrate with demuxArray
  if (typeof content === 'object' &&
     (!Array.isArray(content) ||
     (typeof _.last(content) === 'object') &&
     (!Array.isArray(_.last(content)))))
    return new Document(content, name, parent);
  else
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

module.exports.parseOpts = function (args) {
  var opts = {};
  for (var i = 0; i < args.length; i++ ) {
    var item = args[i];
    if (typeof item === 'object') {
      opts = _.extend(opts, item);
    } else {
      opts[item] = true;
    }
  }
  return opts;
};
