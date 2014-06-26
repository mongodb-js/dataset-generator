var util = require('./testUtil');

describe('Populator with schema involved arrays', function () {
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

  describe('array of raw types', function() {
    before(function (done) {
      testOptions.size = 50;
      testOptions.schema = 'test/schemas/30_array_field.json';
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
        name: util.Joi.string().required(),
        friends: util.Joi.array().includes(util.Joi.string()).
                                  excludes(util.Joi.object()).required()
      }).length(3);
      testConnection.collection.find().each(function (err, item) {
        util.assert.equal(null, err);
        if(item === null) return done();
        util.Joi.validate(item, schema, function (err, val) {
          util.assert.equal(null, err);
        });
      });
    });

    it('should produce docs with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        util.assert.equal(null, err);
        util.sampleAndStrip(items, 2, function (sample) {
          util.assert.notDeepEqual(sample[0], sample[1]);
          done();
        });
      });
    });

    it('should produce arrays with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        util.assert.equal(null, err);
        util.sampleAndStrip(items, 1, function (sample) {
          // what if array is of length 1
          var friends = sample.friends;
          util.assert.notDeepEqual(friends[0], friends[1]);
          done();
        });
      });
    });
  });

  describe('array of documents', function() {
    before(function (done) {
      testOptions.size = 99;
      testOptions.schema = 'test/schemas/31_array_doc.json';
      testConnection.collection.remove({}, function (err, res) {
        if(err) return done(err);
        util.populator(testOptions, function () {
          done();
        });
      });
    });

    it('should produce correct number of entries', function (done) {
      var trueCount = 99;
      testConnection.collection.count(function (err, count) {
        util.assert.equal(null, err);
        util.assert.equal(trueCount, count);
        done();
      });
    });

    it('should produce correct schema structure', function (done) {
      var schema = util.Joi.object().keys({
        _id: util.Joi.any().required(),
        name: util.Joi.string().required(),
        friends: util.Joi.array().includes(util.Joi.object().keys({
          name: util.Joi.string().required(),
          phone: util.Joi.string().regex(util.regex.phone).required()
        }).length(2)).required()
      }).length(3);
      testConnection.collection.find().each(function (err, item) {
        util.assert.equal(null, err);
        if(item === null) return done();
        util.Joi.validate(item, schema, function (err, val) {
          util.assert.equal(null, err);
        });
      });
    });

    it('should produce docs with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        util.assert.equal(null, err);
        util.sampleAndStrip(items, 2, function (sample) {
          util.assert.notDeepEqual(sample[0], sample[1]);
          done();
        });
      });
    });

    it('should produce arrays with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        util.assert.equal(null, err);
        util.sampleAndStrip(items, 1, function (sample) {
          var friends = sample.friends;
          util.assert.notDeepEqual(friends[0], friends[1]);
          done();
        });
      });
    });
  });

  describe('array of embedded docs', function() {
    before(function (done) {
      testOptions.size = 13;
      testOptions.schema = 'test/schemas/32_array_embed.json';
      testConnection.collection.remove({}, function (err, res) {
        if(err) return done(err);
        util.populator(testOptions, function () {
          done();
        });
      });
    });

    it('should produce correct number of entries', function (done) {
      var trueCount = 13;
      testConnection.collection.count(function (err, count) {
        util.assert.equal(null, err);
        util.assert.equal(trueCount, count);
        done();
      });
    });

    it('should produce correct schema structure', function (done) {
      var schema = util.Joi.object().keys({
        _id: util.Joi.any().required(),
        name: util.Joi.string().required(),
        friends: util.Joi.array().includes(util.Joi.object().keys({
          name: util.Joi.string().required(),
          payment_method: util.Joi.object().keys({
            type: util.Joi.string().required(),
            card: util.Joi.number().integer().required(),
            expiration: util.Joi.string().regex(util.regex.exp).required()
          }).length(3).required()
        }).length(2)).required()
      }).length(3);
      testConnection.collection.find().each(function (err, item) {
        util.assert.equal(null, err);
        if(item === null) return done();
        util.Joi.validate(item, schema, function (err, val) {
          util.assert.equal(null, err);
        });
      });
    });

    it('should produce docs with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        util.assert.equal(null, err);
        util.sampleAndStrip(items, 2, function (sample) {
          util.assert.notDeepEqual(sample[0], sample[1]);
          done();
        });
      });
    });

    it('should produce arrays with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        util.assert.equal(null, err);
        util.sampleAndStrip(items, 1, function (sample) {
          var friends = sample.friends;
          util.assert.notDeepEqual(friends[0], friends[1]);
          done();
        });
      });
    });
  });

  describe('array of arrays', function() {
    before(function (done) {
      testOptions.size = 9;
      testOptions.schema = 'test/schemas/33_array_arrays.json';
      testConnection.collection.remove({}, function (err, res) {
        if(err) return done(err);
        util.populator(testOptions, function () {
          done();
        });
      });
    });

    it('should produce correct number of entries', function (done) {
      var trueCount = 9;
      testConnection.collection.count(function (err, count) {
        util.assert.equal(null, err);
        util.assert.equal(trueCount, count);
        done();
      });
    });

    it('should produce correct schema structure', function (done) {
      var schema = util.Joi.object().keys({
        _id: util.Joi.any().required(),
        name: util.Joi.string().required(),
        friends: util.Joi.array().includes(util.Joi.object().keys({
          name: util.Joi.string().required(),
          payment_method: util.Joi.array().includes(util.Joi.object().keys({
            type: util.Joi.string().required(),
            card: util.Joi.number().integer().required(),
            expiration: util.Joi.string().regex(util.regex.exp).required()
          }).length(3)).required()
        }).length(2)).required()
      }).length(3);
      testConnection.collection.find().each(function (err, item) {
        util.assert.equal(null, err);
        if(item === null) return done();
        util.Joi.validate(item, schema, function (err, val) {
          util.assert.equal(null, err);
        });
      });
    });

    it('should produce docs with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        util.assert.equal(null, err);
        util.sampleAndStrip(items, 2, function (sample) {
          util.assert.notDeepEqual(sample[0], sample[1]);
          done();
        });
      });
    });

    it('should produce arrays with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        util.assert.equal(null, err);
        util.sampleAndStrip(items, 1, function (sample) {
          var friends = sample.friends;
          util.assert.notDeepEqual(friends[0], friends[1]);
          done();
        });
      });
    });

    it('should produce embedded arrays with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        util.assert.equal(null, err);
        util.sampleAndStrip(items, 1, function (sample) {
          util.sampleAndStrip(sample.friends, 1, function (sample) {
            var payments = sample.payment_method;
            util.assert.notDeepEqual(payments[0], payments[1]);
            done();
          });
        });
      });
    });
  });

});
