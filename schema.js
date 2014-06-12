var Schema = function () {
	if (Schema.prototype._singletonInstance) {
		return Schema.prototype._singletonInstance;
	}
	Schema.prototype._singletonInstance = this;

	var schema = {};
	this.getSchema = function () {
		return schema;
	};
	this.setSchema = function (s) { // todo: actually build the object
		schema = s;
	};
};

module.exports = Schema;
