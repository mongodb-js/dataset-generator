var util = require('./testUtil');

describe('Populator with empty schema', function () {
	var _connection = {};
	var _options = {};

  before(function(done) {
  	_options.host = 'localhost';
  	_options.port = '27017';
  	_options.db = 'test';
  	_options.collection = 'dataset';
  	_options.schemaPath = 'test/schema_empty.json';
  	util.setUp(_options, function(err, connection) {
  		if(err) return done(err);
  		_connection = connection;
  		done();
  	});
  });

  after(function(done) {
  	util.tearDown(_connection, done);
  });

  // smoke test
  describe('when size = 0 (smoke test)', function() {

  	before(function(done) {
	  	_options.size = 0;
	  	_connection.collection.remove({}, function(err, res) {
	  		if(err) return done(err);
				util.populator(_options, function() {
					done();
				});
	  	});
  	});

		it('should not insert any entry', function (done) {
			util.testCount(_connection, 0, done);
		});

  });

  // basic test
  describe('when size is small', function() {

  	before(function(done) {
	  	_options.size = 5;
	  	util.populator(_options, function() {
	  		done();
	  	});
  	});

		it('should have the correct size', function (done) {
			util.testCount(_connection, 5, done);
		});

		it('should have entries with only _id field', function (done) {
			var schema = util.Joi.object().keys({
				_id: util.Joi.any().required()
			}).length(1);
			util.testEach(_connection, schema, done);
		});

  });

});
