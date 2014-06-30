var helper = require('./testUtil');
var Joi = require('joi');
var assert = require('assert');

describe('complex schema', function() {
  var res = { items: null };
  var expected = {
    count: 31,
    schema: Joi.object().keys({
      _id: Joi.any().required(),
      user_email: Joi.string().email().required(),
      job: Joi.object().keys({
        company: Joi.string().required(),
        phones: Joi.object().keys({
          mobile: Joi.string().regex(helper.regex.phone).required(),
          work: Joi.string().regex(helper.regex.phone).required()
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
          .includes(Joi.string().regex(helper.regex.phone))
          .excludes(Joi.object()).required()
      }).length(2)).required()
    }).length(5)
  };

  before(function(done) {
    var opts = {
      size: 31,
      schemaPath: 'test/schemas/91_complex.json'
    };
    helper.getResults(opts, function (err, items) {
      if (err) return done(err);
      res.items = items;
      done();
    });
  });

  it('should have the correct size', function () {
    assert.equal(expected.count, res.items.length);
  });

  it('should produce correct schema structure', function () {
    res.items.forEach(function (item) {
      Joi.validate(item, expected.schema, function(err, val) {
        assert.equal(null, err);
      });
    });
  });

  it('should produce entries with random content', function (done) {
    helper.sampleAndStrip(res.items, 2, function (sample) {
      assert.notDeepEqual(sample[0], sample[1]);
      done();
    });
  });

  it('should produce arrays with random content', function (done) {
    var validItems = res.items.filter(function (item) {
      return item.friends.length > 1;
    });
    helper.sampleAndStrip(validItems, 1, function (sample) {
      var friends = sample.friends;
      assert.notDeepEqual(friends[0], friends[1]);
      done();
    });
  });

  it('should produce embedded arrays with random content', function (done) {
    var validItems = res.items.filter(function (item) {
      return item.friends.filter(function (item) {
        return item.phones.length > 1;
      }).length > 0;
    });
    helper.sampleAndStrip(validItems, 1, function (sample) {
      var validSubItems = sample.friends.filter(function (item) {
        return item.phones.length > 1;
      });
      helper.sampleAndStrip(validSubItems, 1, function (sample) {
        var phones = sample.phones;
        assert.notDeepEqual(phones[0], phones[1]);
        done();
      });
    });
  });

});
