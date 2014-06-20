var util = require('./testUtil');

describe('Populator with empty schema', function () {
  var _connection = {};
  var _options = {};

  before(function(done) {
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
      var trueCount = 0;
      _connection.collection.count(function(err, count) {
        util.assert.equal(null, err);
        util.assert.equal(trueCount, count);
        done();
      });
    });
  });
  // end of smoke test

  // basic test
  describe('when size is small', function() {
    before(function(done) {
      _options.size = 5;
      util.populator(_options, function() {
        done();
      });
    });

    it('should have the correct size', function (done) {
      var trueCount = 5;
      _connection.collection.count(function(err, count) {
        util.assert.equal(null, err);
        util.assert.equal(trueCount, count);
        done();
      });
    });

    it('should have entries with only _id field', function (done) {
      var schema = util.Joi.object().keys({
        _id: util.Joi.any().required()
      }).length(1);
      _connection.collection.find().each(function(err, item) {
        util.assert.equal(null, err);
        if(item === null) return done();
        util.Joi.validate(item, schema, function(err, val) {
          util.assert.equal(null, err);
        });
      });
    });
  });
  // end of basic test

});
