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
