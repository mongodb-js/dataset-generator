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
	var treeSize = 1; // count itself
	var flatSchema = {};
	var field, type, childId;
	for (field in schema) {
		type = schema[field];
		if (typeof type !== 'object') {
			flatSchema[field] = type;
		} else if (type instanceof Array) {
		} else {
			childId = id + treeSize;
			treeSize += buildMixinHelper(type, childId);
			flatSchema[field] = '_' + childId;
		}
	}
	debug('id=%d, flatSchema -> %j', id, flatSchema);
	// add new mixin corresponding to schema
	var mixin = {};
	mixin['_' + id] = function () {
		var o = {};
    var field, type;
    for (field in flatSchema) {
      type = flatSchema[field];
      // calling chance must happen inside this function
      if (type instanceof Array) {
      	o[field] = [];
      	for (var i = 0; i < chance.d6(); i++) {
      		o[field].push(chance[type]());
      	}
      } else {
	      o[field] = chance[type]();
	    }
    }
    return o;
  };
  chance.mixin(mixin);
  return treeSize;
}
