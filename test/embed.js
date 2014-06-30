var helper = require('./helper');
var Joi = require('joi');
var assert = require('assert');

describe('basic embedded schema', function() {
  var res = { items: null };
  var expected = {
    count: 50,
    schema: Joi.object().keys({
      _id: Joi.any().required(),
      user_email: Joi.string().email().required(),
      job: Joi.object().keys({
        company: Joi.string().required(),
        phone: Joi.string().regex(helper.regex.phone).required(),
        duties: Joi.string().required(),
      }).length(3).required()
    }).length(3)
  };

  before(function(done) {
    var opts = {
      size: 50,
      schemaPath: 'test/schemas/20_embedded_basic.json'
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

});

describe('schema with parallel embedded fields', function() {
  var res = { items: null };
  var expected = {
    count: 33,
    schema: Joi.object().keys({
      _id: Joi.any().required(),
      user_email: Joi.string().email().required(),
      job: Joi.object().keys({
        company: Joi.string().required(),
        phone: Joi.string().regex(helper.regex.phone).required(),
        duties: Joi.string().required(),
      }).length(3).required(),
      payment_method: Joi.object().keys({
        type: Joi.string().required(),
        card: Joi.number().integer().required(),
        expiration: Joi.string().regex(helper.regex.exp).required()
      }).length(3).required()
    }).length(4)
  };

  before(function(done) {
    var opts = {
      size: 33,
      schemaPath: 'test/schemas/21_embedded_multi.json'
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

});

describe('schema with high level of embedding', function() {
  var res = { items: null };
  var expected = {
    count: 23,
    schema: Joi.object().keys({
      _id: Joi.any().required(),
      user_email: Joi.string().email().required(),
      personalities: Joi.object().keys({
        favorites: Joi.object().keys({
          number: Joi.number().integer().max(10).required(),
          city: Joi.string().required(),
          radio: Joi.string().required()
        }).length(3).required(),
        rating: Joi.number().integer().max(6).required(),
      }).length(2).required()
    }).length(3)
  };

  before(function(done) {
    var opts = {
      size: 23,
      schemaPath: 'test/schemas/22_embedded_level.json'
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

});

describe('complex embedded schema', function() {
  var res = { items: null };
  var expected = {
    count: 19,
    schema: Joi.object().keys({
      _id: Joi.any().required(),
      user_email: Joi.string().email().required(),
      job: Joi.object().keys({
        company: Joi.string().required(),
        phone: Joi.string().regex(helper.regex.phone).required(),
        duties: Joi.string().required(),
      }).length(3).required(),
      personalities: Joi.object().keys({
        favorites: Joi.object().keys({
          number: Joi.number().integer().max(10).required(),
          city: Joi.string().required(),
          radio: Joi.string().required()
        }).length(3).required(),
        rating: Joi.number().integer().max(6).required(),
      }).length(2).required(),
      payment_method: Joi.object().keys({
        type: Joi.string().required(),
        card: Joi.number().integer().required(),
        expiration: Joi.string().regex(helper.regex.exp).required()
      }).length(3).required()
    }).length(5)
  };

  before(function(done) {
    var opts = {
      size: 19,
      schemaPath: 'test/schemas/23_embedded_complex.json'
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

});
