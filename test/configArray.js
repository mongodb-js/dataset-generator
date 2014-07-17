var helper = require('./helper');
var assert = require('assert');

describe('configurable arrays', function() {
  var res = { items: null };
  before(function(done) {
    var opts = {
      size: 50,
      schema: {
        'defaults': [ 'default options apply' ],
        'hardcoded': {
          'zero': [ 0, 'should not appear' ],
          'normal': [ 3, '{{Double(counter())}}']
        },
        'random': {
          'field': [ '{{_.random(1, 1)}}', '{{chance.name()}}' ],
          'doc': [ '{{_.random(1, 3)}}', {
            'some_field': '{{chance.name()}}'
          } ]
        }
      }
    };
    helper.getResults(opts, function (err, items) {
      if (err) return done(err);
      res.items = items;
      done();
    });
  });

  it('should not affect un-configured array', function () {
    res.items.forEach(function (item) {
      assert.ok(Array.isArray(item.defaults));
      var l = item.defaults.length;
      assert.ok(l < 4 && l > 0);
    });
  });

  it('should support hardcoded array length', function () {
    res.items.forEach(function (item) {
      assert.ok(Array.isArray(item.hardcoded.zero));
      assert.ok(Array.isArray(item.hardcoded.normal));
      assert.equal(0, item.hardcoded.zero.length);
      assert.equal(3, item.hardcoded.normal.length);
    });
  });

  it('should support random array length', function () {
    res.items.forEach(function (item) {
      assert.ok(Array.isArray(item.random.field));
      assert.ok(Array.isArray(item.random.doc));
      assert.equal(1, item.random.field.length);
      var l = item.random.doc.length;
      assert.ok(l > 0 && l < 4);
    });
  });

});
