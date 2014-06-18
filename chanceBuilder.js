var chance = require('chance').Chance();
var debug = require('debug')('dataset:myChance');
/**
 * A utility method to build the mixin needed for the input schema
 */
module.exports = function buildMixin (schema) {
	debug('Start building schema -> %j', schema);
	buildMixinHelper(schema, 0);
	return chance;
};

function buildMixinHelper (schema, id) {
	debug('id=%d starts building, schema -> %j', id, schema);
	var funcName = '_' + id;
	var flatSchema = {};
	var field, type;
	for (field in schema) {
		type = schema[field];
		if (typeof type === 'object') {
			buildMixinHelper(type, ++id);
			flatSchema[field] = '_' + id;
		} else {
			flatSchema[field] = type;
		}
	}
	debug('func=%s, flatSchema -> %j', funcName, flatSchema);
	// add new mixin corresponding to schema
	var mixin = {};
	mixin[funcName] = function () {
		var o = {};
    var field, type;
    for (field in flatSchema) {
      type = flatSchema[field];
      // calling chance must happen inside this function
      o[field] = chance[type]();
    }
    return o;
  };
  chance.mixin(mixin);
}
