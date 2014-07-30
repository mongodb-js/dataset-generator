var helpers = require('./helpers');
var assert = require('assert');

describe('configurable arrays', function() {
  var res = { items: null };
  before(function(done) {
    var schema = {
      'normal': {
        'empty': [ ],
        'single': [ 0 ],
        'multi': [ 0, 1 ],
        'random': [
          '{{Number(chance.d10())}}',
          '{{chance.name()}}'
        ],
        'mix': [
          1,
          { 'doc': 'got it' },
          [ 0, 1 ]
        ]
      },
      'hardcoded': {
        'zero': [ '{{_$config}}',
          { size: 0 },
          'nope'
        ],
        'count': [ '{{_$config}}',
          { size: 3 },
          '{{counter()}}'
        ]
      },
      'range': {
        'names': [ '{{_$config}}',
          { size: [2, 4] },
          '{{chance.name()}}'
        ]
      }
    };
    var opts = {
      size: 10,
    };
    helpers.generate(schema, opts, function (err, items) {
      if (err) return done(err);
      res.items = items;
      done();
    });
  });

  it('should support constant normal array', function () {
    var normal = res.items[0].normal;
    assert.ok(Array.isArray(normal.empty));
    assert.equal(0, normal.empty.length);
    assert.ok(Array.isArray(normal.single));
    assert.equal(1, normal.single.length);
    assert.equal(0, normal.single[0]);
    assert.ok(Array.isArray(normal.multi));
    assert.equal(2, normal.multi.length);
    assert.equal(0, normal.multi[0]);
    assert.equal(1, normal.multi[1]);
  });

  it('should support normal array of mixed types', function () {
    var mix = res.items[0].normal.mix;
    assert.ok(Array.isArray(mix));
    assert.equal(3, mix.length);
    assert.equal(1, mix[0]);
    assert.ok(typeof mix[1] === 'object');
    assert.equal('got it', mix[1].doc);
    assert.ok(Array.isArray(mix[2]));
    assert.equal(2, mix[2].length);
    assert.equal(0, mix[2][0]);
    assert.equal(1, mix[2][1]);
  });

  it('should support random normal array', function (done) {
    var rand = res.items[0].normal.random;
    assert.ok(Array.isArray(rand));
    assert.equal(2, rand.length);
    assert.ok(typeof rand[0] === 'number');
    assert.ok(typeof rand[1] === 'string');
    helpers.sampleAndStrip(res.items, 3, function (sample) {
      var dices = sample.map(function (s) {
        return s.normal.random[0];
      });
      var names = sample.map(function (s) {
        return s.normal.random[1];
      });
      assert.ok(dices[0] !== dices[1] || dices[0] !== dices[2]);
      assert.ok(names[0] !== names[1] || names[0] !== names[2]);
      done();
    });
  });

  it('should support hardcoded length', function () {
    var hardcoded = res.items[0].hardcoded;
    assert.ok(Array.isArray(hardcoded.zero));
    assert.equal(0, hardcoded.zero.length);
    assert.ok(Array.isArray(hardcoded.count));
    assert.equal(3, hardcoded.count.length);
    assert.equal(0, hardcoded.count[0]);
    assert.equal(1, hardcoded.count[1]);
    assert.equal(2, hardcoded.count[2]);
  });

  it('should support random array length', function () {
    res.items.forEach(function (item) {
      assert.ok(Array.isArray(item.range.names));
      var l = item.range.names.length;
      assert.ok(l > 1 && l < 5);
    });
  });

});
