var util = require('./testUtil');

describe('Populator with empty schema', function () {
	var _connection;
	var _options = {
    host: 'localhost',
    port: '27017',
    db: 'test',
    collection: 'dataset',
		schema: 'test/schema_empty.json',
		size: 100
	};

  before(function(done) {
  	util.setUp(_options, function(err, connection) {
  		if(err) return done(err);
  		_connection = connection;
  		util.populator(_options, function() {
  			done();
  		});
  	});
  });

  after(function(done) {
  	util.tearDown(_connection, done);
  });

	it('should have the correct size', function (done) {
		_connection.collection.count(function (err, count) {
			if (err) done(err);
			util.assert.equal(count, _options.size);
			done();
		});
	});

	it('entries should be empty', function (done) {
		var cursor = _connection.collection.find();
		cursor.each(function (err, item) {
			if (err) done(err);
			if (item === null) {
				done();
			} else {
				var keys = Object.keys(item);
				util.assert(keys.length, 1);
			}
		});
	});

});
