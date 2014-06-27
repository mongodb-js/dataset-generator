var util = require('./testUtil');

describe('Populator with empty schema', function () {
  var testConnection = {};
  var testOptions = {};

  before(function(done) {
    util.setUp(testOptions, function(err, connection) {
      if(err) return done(err);
      testConnection = connection;
      done();
    });
  });

  after(function(done) {
    util.tearDown(testConnection, done);
  });

  describe('when size = 0 (smoke test)', function() {
    before(function(done) {
      testOptions.size = 0;
      testOptions.schema = 'test/schemas/00_empty.json';
      testConnection.collection.remove({}, function(err, res) {
        if(err) return done(err);
        util.populator(testOptions, function() {
          done();
        });
      });
    });

    it('should not insert any entry', function (done) {
      var trueCount = 0;
      testConnection.collection.count(function(err, count) {
        util.assert.equal(null, err);
        util.assert.equal(trueCount, count);
        done();
      });
    });
  });

  describe('when size is small', function() {
    before(function(done) {
      testOptions.size = 5;
      testOptions.schema = 'test/schemas/00_empty.json';
      util.populator(testOptions, function() {
        done();
      });
    });

    it('should have the correct size', function (done) {
      var trueCount = 5;
      testConnection.collection.count(function(err, count) {
        util.assert.equal(null, err);
        util.assert.equal(trueCount, count);
        done();
      });
    });

    it('should have entries with only _id field', function (done) {
      var schema = util.Joi.object().keys({
        _id: util.Joi.any().required()
      }).length(1);
      testConnection.collection.find().each(function(err, item) {
        util.assert.equal(null, err);
        if(item === null) return done();
        util.Joi.validate(item, schema, function(err, val) {
          util.assert.equal(null, err);
        });
      });
    });
  });

  describe('basic schema', function() {
    before(function (done) {
      testOptions.size = 111;
      testOptions.schema = 'test/schemas/10_flat.json';
      testConnection.collection.remove({}, function (err, res) {
        if(err) return done(err);
        util.populator(testOptions, function () {
          done();
        });
      });
    });

    it('should produce correct number of entries', function (done) {
      var trueCount = 111;
      testConnection.collection.count(function (err, count) {
        util.assert.equal(null, err);
        util.assert.equal(trueCount, count);
        done();
      });
    });

    it('should produce correct schema structure', function (done) {
      var schema = util.Joi.object().keys({
        _id: util.Joi.any().required(),
        username: util.Joi.string().required(),
        email: util.Joi.string().email().required(),
      }).length(3);
      testConnection.collection.find().each(function (err, item) {
        util.assert.equal(null, err);
        if(item === null) return done();
        util.Joi.validate(item, schema, function (err, val) {
          util.assert.equal(null, err);
        });
      });
    });

    it('should produce entries with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        util.assert.equal(null, err);
        util.sampleAndStrip(items, 2, function (sample) {
          util.assert.notDeepEqual(sample[0], sample[1]);
          done();
        });
      });
    });
  });


});
