var util = require('./testUtil');
var Joi = require('joi');
var assert = require('assert');

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
      testOptions.schemaPath = 'test/schemas/91_complex.json';
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
        assert.equal(null, err);
        assert.equal(trueCount, count);
        done();
      });
    });

    it('should produce correct schema structure', function (done) {
      var schema = Joi.object().keys({
        _id: Joi.any().required(),
        user_email: Joi.string().email().required(),
        job: Joi.object().keys({
          company: Joi.string().required(),
          phones: Joi.object().keys({
            mobile: Joi.string().regex(util.regex.phone).required(),
            work: Joi.string().regex(util.regex.phone).required()
          }).length(2).required(),
          duties: Joi.string().required(),
        }).length(3).required(),
        personalities: Joi.object().keys({
          favorites: Joi.object().keys({
            number: Joi.number().integer().max(10).required(),
            city: Joi.string().required(),
            radio: Joi.string().required()
          }).length(3).required(),
          'violence-rating': Joi.number().integer().max(6).required(),
        }).length(2).required(),
        friends: Joi.array().includes(Joi.object().keys({
          name: Joi.string().required(),
          phones: Joi.array()
            .includes(Joi.string().regex(util.regex.phone))
            .excludes(Joi.object()).required()
        }).length(2)).required()
      }).length(5);
      testConnection.collection.find().each(function (err, item) {
        assert.equal(null, err);
        if(item === null) return done();
        Joi.validate(item, schema, function (err, val) {
          assert.equal(null, err);
        });
      });
    });

    it('should produce docs with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        assert.equal(null, err);
        util.sampleAndStrip(items, 2, function (sample) {
          assert.notDeepEqual(sample[0], sample[1]);
          done();
        });
      });
    });

    it('should produce arrays with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        assert.equal(null, err);
        var validItems = items.filter(function (item) {
          return item.friends.length > 1;
        });
        util.sampleAndStrip(validItems, 1, function (sample) {
          var friends = sample.friends;
          assert.notDeepEqual(friends[0], friends[1]);
          done();
        });
      });
    });

    it('should produce embedded arrays with random content', function (done) {
      testConnection.collection.find().toArray(function (err, items) {
        assert.equal(null, err);
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
            assert.notDeepEqual(phones[0], phones[1]);
            done();
          });
        });
      });
    });

  });
});
