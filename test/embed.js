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
        user_email: util.chanceJoi.email.required(),
        job: util.Joi.object().keys({
          company: util.chanceJoi.word.required(),
          phone: util.chanceJoi.phone.required(),
          duties: util.chanceJoi.sentence.required()
        }).length(3)
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
