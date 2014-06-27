var util = require('./testUtil');

describe('Populator', function () {
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

  describe('complex schema', function() {
    before(function (done) {
      testOptions.size = 31;
      testOptions.schema = 'test/schemas/91_complex.json';
      testConnection.collection.remove({}, function (err, res) {
        if(err) return done(err);
        util.populator(testOptions, function () {
          done();
        });
      });
    });

    it('should produce correct number of entries', function (done) {
      var trueCount = 31;
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
          phones: util.Joi.object().keys({
            mobile: util.Joi.string().regex(util.regex.phone).required(),
            work: util.Joi.string().regex(util.regex.phone).required()
          }).length(2).required(),
          duties: util.Joi.string().required(),
        }).length(3).required(),
        personalities: util.Joi.object().keys({
          favorites: util.Joi.object().keys({
            number: util.Joi.number().integer().max(10).required(),
            city: util.Joi.string().required(),
            radio: util.Joi.string().required()
          }).length(3).required(),
          'violence-rating': util.Joi.number().integer().max(6).required(),
        }).length(2).required(),
        friends: util.Joi.array().includes(util.Joi.object().keys({
          name: util.Joi.string().required(),
          phones: util.Joi.array()
            .includes(util.Joi.string().regex(util.regex.phone))
            .excludes(util.Joi.object()).required()
        }).length(2)).required()
      }).length(5);
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
        var validItems = items.filter(function (item) {
          return item.friends.length > 1;
        });
        util.sampleAndStrip(validItems, 1, function (sample) {
          var friends = sample.friends;
          util.assert.notDeepEqual(friends[0], friends[1]);
          done();
        });
      });
    });

    it('should produce embedded arrays with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        util.assert.equal(null, err);
        var validItems = items.filter(function (item) {
          return item.friends.filter(function (item) {
            return item.phones.length > 1;
          }).length > 0;
        });
        util.sampleAndStrip(validItems, 1, function (sample) {
          var validSubItems = sample.friends.filter(function (item) {
            return item.phones.length > 1;
          });
          util.sampleAndStrip(validSubItems, 1, function (sample) {
            var phones = sample.phones;
            util.assert.notDeepEqual(phones[0], phones[1]);
            done();
          });
        });
      });
    });

  });
});
