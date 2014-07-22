var _ = require('underscore');
var Document = require('./document');
var Field = require('./field');

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
