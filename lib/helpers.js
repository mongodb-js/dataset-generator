var _ = require('underscore');

function templateDecoder (input) {
  // a very simplistic approach, should be more complex
  if (input.schemas) {
    return {
      header: _.omit(input, 'schemas', 'mongodb'),
      mongodb: input.mongodb,
      schemas: input.schemas
    };
  } else { //legacy
    return {
      legacy: true,
      header: { name: 'task' + Date.now() },
      mongodb: 'not configured',
      schemas: input
    };
  }
}

// @todo
function outputFilter (chunk) {
  return chunk;
}

module.exports.outputFilter = outputFilter;
module.exports.templateDecoder = templateDecoder;
