var _ = require('underscore'),
  Document = require('./document'),
  Field = require('./field'),
  ArrayField = require('./array'),
  Joi = require('joi');

module.exports.build = function (content, name, parent) {
  if (Array.isArray(content))
    return new ArrayField(content, name, parent);
  if (typeof content === 'object')
    return new Document(content, name, parent);
  return new Field(content, name, parent);
};
