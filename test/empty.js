var util = require('./testUtil');

describe('Populator with empty schema', function () {
	var _connection = {};
	var _options = {};

  before(function(done) {
  	_options.host = 'localhost';
  	_options.port = '27017';
  	_options.db = 'test';
  	_options.collection = 'dataset';
  	_options.schema = 'test/schema_empty.json';
  	util.setUp(_options, function(err, connection) {
  		if(err) return done(err);
  		_connection = connection;
  		done();
  	});
  });

  afterEach(function(done) {
  	_options.size = null;
  	_connection.collection.remove({}, done);
  });

  after(function(done) {
  	util.tearDown(_connection, done);
  });

  // smoke test
  describe('length of data to generate is zero', function() {

  	before(function(done) {
	  	_options.size = 0;
	  	util.populator(_options, function() {
	  		done();
	  	});
  	});

		it('should not insert any entry', function (done) {
			_connection.collection.count(function (err, count) {
				if (err) done(err);
				util.assert.equal(count, 0);
				done();
			});
		});

  });

  //
  describe('length of data to generate is zero', function() {

  	before(function(done) {
	  	_options.size = 0;
	  	util.populator(_options, function() {
	  		done();
	  	});
  	});

		it('should not insert any entry', function (done) {
			_connection.collection.count(function (err, count) {
				if (err) done(err);
				util.assert.equal(count, 0);
				done();
			});
		});

  });


});
