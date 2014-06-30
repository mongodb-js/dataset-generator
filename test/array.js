var helper = require('./testUtil');
var Joi = require('joi');
var assert = require('assert');

describe('array of primitive types', function() {
  var res = { items: null };
  var expected = {
    count: 31,
    schema: Joi.object().keys({
      _id: Joi.any().required(),
      name: Joi.string().required(),
      friends: Joi.array().includes(Joi.string()).
                           excludes(Joi.object()).required()
    }).length(3)
  };

  before(function(done) {
    var opts = {
      size: 31,
      schemaPath: 'test/schemas/30_array_field.json'
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

});

describe('array of documents', function() {
  var res = { items: null };
  var expected = {
    count: 99,
    schema: Joi.object().keys({
      _id: Joi.any().required(),
      name: Joi.string().required(),
      friends: Joi.array().includes(Joi.object().keys({
        name: Joi.string().required(),
        phone: Joi.string().regex(helper.regex.phone).required()
      }).length(2)).required()
    }).length(3)
  };

  before(function(done) {
    var opts = {
      size: 99,
      schemaPath: 'test/schemas/31_array_doc.json'
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

});

describe('array of embedded docs', function() {
  var res = { items: null };
  var expected = {
    count: 19,
    schema: Joi.object().keys({
      _id: Joi.any().required(),
      name: Joi.string().required(),
      friends: Joi.array().includes(Joi.object().keys({
        name: Joi.string().required(),
        payment_method: Joi.object().keys({
          type: Joi.string().required(),
          card: Joi.number().integer().required(),
          expiration: Joi.string().regex(helper.regex.exp).required()
        }).length(3).required()
      }).length(2)).required()
    }).length(3)
  };

  before(function(done) {
    var opts = {
      size: 19,
      schemaPath: 'test/schemas/32_array_embed.json'
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

});

describe('embedded arrays', function() {
  var res = { items: null };
  var expected = {
    count: 11,
    schema: Joi.object().keys({
      _id: Joi.any().required(),
      name: Joi.string().required(),
      friends: Joi.array().includes(Joi.object().keys({
        name: Joi.string().required(),
        payment_method: Joi.array().includes(Joi.object().keys({
          type: Joi.string().required(),
          card: Joi.number().integer().required(),
          expiration: Joi.string().regex(helper.regex.exp).required()
        }).length(3)).required()
      }).length(2)).required()
    }).length(3)
  };

  before(function(done) {
    var opts = {
      size: 11,
      schemaPath: 'test/schemas/33_array_arrays.json'
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
        return item.payment_method.length > 1;
      }).length > 0;
    });
    helper.sampleAndStrip(validItems, 1, function (sample) {
      var validSubItems = sample.friends.filter(function (item) {
        return item.payment_method.length > 1;
      });
      helper.sampleAndStrip(validSubItems, 1, function (sample) {
        var payment_methods = sample.payment_method;
        assert.notDeepEqual(payment_methods[0], payment_methods[1]);
        done();
      });
    });
  });

});
