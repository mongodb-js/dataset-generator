var util = require('./testUtil');

describe('Populator with embedded schema', function () {
  var testConnection = {};
  var testOptions = {};

  before(function (done) {
    util.setUp(testOptions, function (err, connection) {
      if(err) return done(err);
      testConnection = connection;
      done();
    });
  });

  after(function (done) {
    util.tearDown(testConnection, done);
  });

  describe('basic embedded schema', function() {
    before(function (done) {
      testOptions.size = 50;
      testOptions.schema = 'test/schemas/20_embedded_basic.json';
      testConnection.collection.remove({}, function (err, res) {
        if(err) return done(err);
        util.populator(testOptions, function () {
          done();
        });
      });
    });

    it('should produce correct number of entries', function (done) {
      var trueCount = 50;
      testConnection.collection.count(function (err, count) {
        util.assert.equal(null, err);
        util.assert.equal(trueCount, count);
        done();
      });
    });

    it('should produce correct schema structure', function (done) {
      var schema = util.Joi.object().keys({
        _id: util.Joi.any().required(),
        user_email: util.Joi.string().email().required(),
        job: util.Joi.object().keys({
          company: util.Joi.string().required(),
          phone: util.Joi.string().regex(util.regex.phone).required(),
          duties: util.Joi.string().required(),
        }).length(3).required()
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

  describe('schema with parallel embedded fields', function() {
    before(function (done) {
      testOptions.size = 33;
      testOptions.schema = 'test/schemas/21_embedded_multi.json';
      testConnection.collection.remove({}, function (err, res) {
        if(err) return done(err);
        util.populator(testOptions, function () {
          done();
        });
      });
    });

    it('should produce correct number of entries', function (done) {
      var trueCount = 33;
      testConnection.collection.count(function (err, count) {
        util.assert.equal(null, err);
        util.assert.equal(trueCount, count);
        done();
      });
    });

    it('should produce correct schema structure', function (done) {
      var schema = util.Joi.object().keys({
        _id: util.Joi.any().required(),
        user_email: util.Joi.string().email().required(),
        job: util.Joi.object().keys({
          company: util.Joi.string().required(),
          phone: util.Joi.string().regex(util.regex.phone).required(),
          duties: util.Joi.string().required(),
        }).length(3).required(),
        payment_method: util.Joi.object().keys({
          type: util.Joi.string().required(),
          card: util.Joi.number().integer().required(),
          expiration: util.Joi.string().regex(util.regex.exp).required()
        }).length(3).required()
      }).length(4);
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

  describe('schema with high level of embedding', function() {
    before(function (done) {
      testOptions.size = 23;
      testOptions.schema = 'test/schemas/22_embedded_level.json';
      testConnection.collection.remove({}, function (err, res) {
        if(err) return done(err);
        util.populator(testOptions, function () {
          done();
        });
      });
    });

    it('should produce correct number of entries', function (done) {
      var trueCount = 23;
      testConnection.collection.count(function (err, count) {
        util.assert.equal(null, err);
        util.assert.equal(trueCount, count);
        done();
      });
    });

    it('should produce correct schema structure', function (done) {
      var schema = util.Joi.object().keys({
        _id: util.Joi.any().required(),
        user_email: util.Joi.string().email().required(),
        personalities: util.Joi.object().keys({
          favorites: util.Joi.object().keys({
            number: util.Joi.number().integer().max(10).required(),
            city: util.Joi.string().required(),
            radio: util.Joi.string().required()
          }).length(3).required(),
          rating: util.Joi.number().integer().max(6).required(),
        }).length(2).required()
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

  describe('complex embedded schema', function() {
    before(function (done) {
      testOptions.size = 19;
      testOptions.schema = 'test/schemas/23_embedded_complex.json';
      testConnection.collection.remove({}, function (err, res) {
        if(err) return done(err);
        util.populator(testOptions, function () {
          done();
        });
      });
    });

    it('should produce correct number of entries', function (done) {
      var trueCount = 19;
      testConnection.collection.count(function (err, count) {
        util.assert.equal(null, err);
        util.assert.equal(trueCount, count);
        done();
      });
    });

    it('should produce correct schema structure', function (done) {
      var schema = util.Joi.object().keys({
        _id: util.Joi.any().required(),
        user_email: util.Joi.string().email().required(),
        job: util.Joi.object().keys({
          company: util.Joi.string().required(),
          phone: util.Joi.string().regex(util.regex.phone).required(),
          duties: util.Joi.string().required(),
        }).length(3).required(),
        personalities: util.Joi.object().keys({
          favorites: util.Joi.object().keys({
            number: util.Joi.number().integer().max(10).required(),
            city: util.Joi.string().required(),
            radio: util.Joi.string().required()
          }).length(3).required(),
          rating: util.Joi.number().integer().max(6).required(),
        }).length(2).required(),
        payment_method: util.Joi.object().keys({
          type: util.Joi.string().required(),
          card: util.Joi.number().integer().required(),
          expiration: util.Joi.string().regex(util.regex.exp).required()
        }).length(3).required()
      }).length(5);
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
