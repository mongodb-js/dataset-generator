var util = require('./testUtil');

describe('Populator with empty schema', function () {
	var _connection = {};
	var _options = {};

  before(function(done) {
  	console.log('before');
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

  after(function(done) {
  	console.log('after');
  	util.tearDown(_connection, done);
  });

  // smoke test
  describe('when size = 0 (smoke test)', function() {

  	before(function(done) {
	  	console.log('before inner 1');
	  	_options.size = 0;
	  	_connection.collection.remove({}, function(err, res) {
	  		if(err) return done(err);
				util.populator(_options, function() {
					done();
				});
	  	});
  	});

		it('should not insert any entry', function (done) {
			console.log('test1-1');
			_connection.collection.count(function (err, count) {
				if (err) return done(err);
				util.assert.equal(count, 0);
				done();
			});
		});

  });

  // basic test
  describe('when size is small', function() {

  	before(function(done) {
  		console.log('test inner 2');
	  	_options.size = 5;
	  	util.populator(_options, function() {
	  		done();
	  	});
  	});

		it('should have the correct size', function (done) {
			console.log('test2-1');
			_connection.collection.count(function (err, count) {
				if (err) return done(err);
				util.assert.equal(count, 5);
				done();
			});
		});

		// it('2', function (done) {
		// 	_connection.collection.count(function (err, count) {
		// 		if (err) return done(err);
		// 		util.assert.equal(count, 5);
		// 		done();
		// 	});
		// });

  });


});
