var debug = require('debug')('mongodb-datasets:schema:context'),
  _ = require('underscore'),
  bson = require('bson'),
  chance = require('chance').Chance(),
  faker = require('faker'),
  helpers = require('./helpers');

/**
 * Context object is solely used as context in function _.template
 * @class
 * @param {!Document} host The Document this Context is used
 * @since 0.1.0
 */
function Context (host) {
  if (!(this instanceof Context)) return new Context(host);

  /**
   * Expose Chance.js library to clients
   * @method
   * @see  {@link http://chancejs.com|Chance}
   * @since 0.1.0
   * @deprecated since 0.2.0
   */
  this.chance = chance;

  /**
   * Expose Faker.js library to clients
   * @method
   * @api public
   * @see  {@link https://github.com/Marak/Faker.js|Faker}
   * @since 0.1.0
   * @deprecated since 0.2.0
   */
  this.faker = faker;

  /**
   * Internal state of this Context
   * @member {Object}
   * @private
   * @property {boolean} display Visibility of the current Field
   * @property {*} override Value overriding the default `_.template` output
   */
  this._state = {
    display: undefined, // when true, the current field will not be visible
    override: undefined // if present, used to override the template output
  };

  /**
   * Collection of utility methods for clients
   * @member {Object}
   * @property {function} sample {@link http://underscorejs.org/#sample}
   */
  this.util = {
    sample: _.sample
  };

  /**
   * Counter
   * @method
   * @param  {number} [id=0]    Index of the counter to increment
   * @param  {number} [start=0] Initial value,
   *                            valid when the counter is initialized
   * @param  {number} [step=1]  Increment of each count
   * @return {number}           Current value of the specified counter
   * @since  0.1.0
   */
  this.counter = function (id, start, step) {
    id = id || 0; // though id=0 is false, does not matter
    debug('counter called id=%d', id);
    var counter = host._schema._state.counter; //pointer
    if (typeof counter[id] === 'undefined') {
      return (counter[id] = start || 0);
    }
    return (counter[id] += (step || 1));
  };

  /**
   * Total number of generated Document's in the current run
   * @instance
   * @memberOf Context
   * @member {number} _$size
   * @since  0.1.4
   */
  Object.defineProperty(this, '_$size', {
    get: function () {
      return host._schema._state.size;
    }
  });

  /**
   * Index of the current Document being generated, starting from 0
   * @instance
   * @memberOf Context
   * @member {number} _$index
   * @since  0.1.4
   */
  Object.defineProperty(this, '_$index', {
    get: function () {
      return host._schema._state.index;
    }
  });

}

/**
 * Change the visibility of current Field
 * @method
 * @param  {boolean} pred Effective if true
 * @since  0.1.4
 */
Context.prototype.hide = function (pred) {
  if (pred) this._state.display = false;
};

/**
 * Convenient method to reset the internal state of this Context
 * @method
 * @private
 * @param  {boolean} hard True when the current Document finishes generating
 */
Context.prototype._reset = function (hard) {
  this._state.override = undefined;
  if (hard) {
    this._state.display = undefined;
  }
};

/////////////////////////////////
// new API for random function //
/////////////////////////////////

/**
 * Each datasets random function (i.e. except chance, faker) accepts a variable
 * number of OptionHash's which aggregate into a single Object internally.
 * @memberOf Context
 * @typedef OptionHash
 * @type {(string|Object)}
 * @example
 * // as {a: true}
 * randomFunc('a');
 * @example
 * // as {}
 * randomFunc({a: 1}, {a: false});
 * @example
 * // as {a: 1, b: 2, c: true}
 * randomFunc({a: 0}, {b: 2}, 'c', {a: 1})
 */

// tile 1: heavy aggregation

/*
 * Options:
 * first: boolean - first name only?
 * last: boolean - last name only?
 * middle: true(initial)/full - with middle name?
 * prefix: true(short)/full - with prefix?
 * gender: male/female
 */
/**
 * [name description]
 * @param {...Context.OptionHash}
 * @return {string} [description]
 */
Context.prototype.name = function () {
  var opts = helpers.mix(arguments);
  var g = opts.gender ? {gender: opts.gender} : {};
  if (opts.first) return chance.first(g);
  if (opts.last) return chance.last(g);
  var m = {}, p = {}, prefix = '', name;
  if (opts.middle)
    m = opts.middle === 'full' ? {middle: true} : {middle_initial: true};
  if (opts.prefix) {
    p = helpers.mix(g, opts.prefix === 'full' ? {full: true} : {});
    prefix = chance.prefix(p) + ' ';
  }
  name = chance.name(_.extend(g, m));
  return prefix + name;
};

/*
 * Options:
 * array: bool
 * delimiter: <string> - default ', '
 * zip: true/long
 * state: true/long
 * city: bool
 * street: true/short
 * full: bool - if produce full address (enabled the above four)
 */
Context.prototype.address = function () {
  var opts = helpers.mix(arguments);
  if (opts.full) opts = helpers.mix('street', 'city', 'state', 'zip', opts);
  var dl = opts.delimiter ? '' + opts.delimiter : ', ';
  var rtn = [], str, st, z;
  if (opts.street) {
    str = opts.street === 'short' ? {short_suffix: true} : {};
    rtn.push(chance.address(str));
  }
  if (opts.city) rtn.push(chance.city());
  if (opts.state) {
    st = opts.state === 'long' ? {full: true} : {};
    rtn.push(chance.state(st));
  }
  if (opts.zip) {
    z = opts.zip === 'long' ? {plusfour: true} : {};
    rtn.push(chance.zip(z));
  }
  if (rtn.length === 0) return chance.address();
  if (opts.array) return rtn;
  if (rtn.length === 1) return '' + rtn[0];
  return rtn.join(dl);
};

/*
 * Options:
 * integer(default): bool
 * float: bool
 * natural: bool
 * min: <num>
 * max: <num>
 * fixed: <num> - number of decimal digits for floats
 * dice: <num> - shortcut for { min: 1, max: num }
 * age: true/child/teen/adult/senior - the full range (true) is 0 ~ 120
 */
Context.prototype.num = function () {
  var opts = helpers.mix(arguments);
  var mm = opts.min !== undefined ? {min: Number(opts.min)} : {};
  var fix = opts.fixed !== undefined ? {fixed: Number(opts.fixed)} : {};
  if (opts.max !== undefined) mm.max = Number(opts.max);
  if (opts.natural) return chance.natural(mm);
  if (opts.float) return chance.floating(helpers.mix(mm, fix));
  if (opts.dice) return chance.integer({min: 1, max: Number(opts.dice)});
  if (opts.age) {
    if (opts.age === true) return chance.age();
    return chance.age({type: opts.age});
  }
  return chance.integer(mm);
};

/*
 * Produce a Date object by default
 * Options:
 *   string: true(short)/long/json/time - short: 12/31/2014
 *   format: <string> - customized format (refer to moment.js) //not supported
 *   integer: true(hammertime)/year/month/day/hour/min/sec/ms
 *   min: <acceptable by Date cnst>
 *   max: <acceptable by Date cnst>
 *   year: <num> - fixed year
 *   month: <num> - fixed month
 *   day: <num> - fixed day
 * Constraints:
 *   min/max must be set in pair (blank means 'now')
 *   min/max and year/month/day cannot be both set
 *   string and integer cannot be both set
 */
Context.prototype.date = function () {
  var opts = helpers.mix(arguments);
  var d;
  if (opts.min || opts.max) {
    d = faker.Date.between(
      opts.min ? new Date() : new Date(opts.min),
      opts.max ? new Date() : new Date(opts.max));
  } else {
    d = chance.date({
      year: Number(opts.year),
      month: opts.month ? Number(opts.month)+1 : undefined,
      day: Number(opts.day)
    });
  }
  if (opts.integer) {
    if (opts.integer === true) return d.getTime();
    if (opts.integer === 'year') return d.getFullYear();
    if (opts.integer === 'month') return d.getMonth() + 1;
    if (opts.integer === 'day') return d.getDate();
    if (opts.integer === 'hour') return d.getHours();
    if (opts.integer === 'min') return d.getMinutes();
    if (opts.integer === 'sec') return d.getSeconds();
    if (opts.integer === 'ms') return d.getMilliseconds();
  }
  if (opts.string) {
    if (opts.string === true)
      return ''+(d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear();
    if (opts.string === 'long') return d.toDateString();
    if (opts.string === 'json') return d.toJSON();
    if (opts.string === 'time') return d.toTimeString();
  }
  return d;
};

/*
 * Options:
 * length: <num> - default is 1
 * pool: 'abcdef...' - a pool of potential chars
 * casing: lower(default)/upper
 * hash: bool - shortcut for {casing: lower, alpha: true}
 * alpha: bool - alpha numeric only
 * symbol: bool - symbols only
 */
Context.prototype.str = function () {
  var opts = helpers.mix(arguments);
  var p = {}, c = opts.casing ? {casing: opts.casing} : {};
  p = opts.symbol ? {symbols: true} : p;
  p = opts.alpha ? {alpha: true} : p;
  p = opts.pool ? {pool: '' + opts.pool} : p;
  if (opts.hash) {
    c = {casing: 'lower'};
    p = {alpha: true};
  }
  if (!opts.length)
    return chance.character(helpers.mix(p, c));
  var rtn = '';
  for (var i = Number(opts.length); i > 0; i--) {
    rtn += chance.character(helpers.mix(p, c));
  }
  return rtn;
};

/*
 * Credit card information
 * default return cc number only
 * Options:
 * array: bool
 * delimiter: <string>
 * type: bool(short)/full
 * num: bool
 * exp: bool
 */
Context.prototype.cc = function () {
  var opts = helpers.mix(arguments);
  var rtn = [], t = chance.cc_type({raw: true});
  if (opts.type) {
    if (opts.type === true) rtn.push(t.short_name);
    if (opts.type === 'full') rtn.push(t.name);
  }
  if (opts.num) rtn.push(chance.cc({type: t.name}));
  if (opts.exp) rtn.push(chance.exp());
  if (opts.array) return rtn;
  if (rtn.length === 0) return chance.cc({type: t.name});
  return rtn.join(opts.delimiter ? '' + opts.delimiter : ', ');
};

// tile 2: mostly switch statement

/*
 * Options:
 * sentence: <num>
 * word: <num>
 * syllable: <num>
 * char: <num>
 */
Context.prototype.text = function () {
  var opts = helpers.mix(arguments);
  if (opts.sentence)
    return chance.paragraph({sentences: Number(opts.sentence)});
  if (opts.word)
    return chance.sentence({words: Number(opts.word)});
  if (opts.syllable)
    return chance.word({syllables: Number(opts.syllable)});
  if (opts.char)
    return chance.word({length: Number(opts.char)});
  return chance.sentence();
};

/*
 * Options:
 * fb: bool - facebook id
 * twitter: bool - twitter id
 * goog_analytics: bool - google analytics tracking code
 * hastag: bool - hastag
 * username: bool - user id
 * guid(default): bool - a guid
 */
Context.prototype.id = function () {
  var opts = helpers.mix(arguments);
  if (opts.fb) return chance.fbid();
  if (opts.twitter) return chance.twitter();
  if (opts.hashtag) return chance.hashtag();
  if (opts.goog_analytics) return chance.google_analytics();
  if (opts.username) return faker.Internet.userName();
  return chance.guid();
};

/*
 * Options:
 * array: bool] - whether produce array (lat in front)
 * delimiter: <string> - default is ', '
 * lat: bool
 * lng: bool
 * fixed: <num>
 */
Context.prototype.coordinates = function () {
  var opts = helpers.mix(arguments);
  var dl = opts.delimiter ? opts.delimiter : ', ';
  var f = opts.fixed === undefined ? {} : {fixed: Number(opts.fixed)};
  var lat = chance.latitude(f), lng = chance.longitude(f);
  if (opts.lat) return lat;
  if (opts.lng) return lng;
  if (opts.array) return [lat, lng];
  return '' + lat + dl + lng;
};

/*
 * Return a random element from all available pools
 * Options:
 * type: tld/gender/radio/tv/currency/state/city/ampm
 */
Context.prototype.pool = function () {
  var opts = helpers.mix(arguments);
  switch (opts.type) {
    case 'tld':
      return chance.tld();
    case 'gender':
      return chance.gender();
    case 'radio':
      return chance.radio();
    case 'tv':
      return chance.tv();
    case 'currency':
      return chance.currency();
    case 'state':
      return chance.state();
    case 'city':
      return chance.city();
    case 'ampm':
      return chance.ampm();
  }
};

// tile 3: limited aggregation

/*
 * Options:
 * areacode: bool - if true, return (###)
 * format: '(###)-###-####' (not yet supported)
 */
Context.prototype.phone = function () {
  var opts = helpers.mix(arguments);
  if (opts.areacode) return chance.areacode();
  return chance.phone();
};

/*
 * Options:
 * v6: bool
 */
Context.prototype.ip = function () {
  var opts = helpers.mix(arguments);
  if (opts.v6) return chance.ipv6();
  return chance.ip();
};

// tile 4: no aggregation

/*
 * Options:
 * tld: <string>
 */
Context.prototype.domain = function () {
  return chance.domain();
};

/*
 * Options:
 * domain: 'example.com'
 */
Context.prototype.email = function () {
  return chance.email();
};

/*
 * Options:
 * format: hex/shorthex/rgb
 * greyscale: bool
 */
Context.prototype.color = function () {
  return chance.color();
};

/*
 * Options:
 * ssnFour: bool
 * dashes: bool
 */
Context.prototype.ssn = function () {
  return chance.ssn();
};

/////////////////////////////////////////
// Constructors of all supported types //
/////////////////////////////////////////

/**
 * Replace `_.template` ouput
 * @method
 * @param {} i Must be acceptable by `Number` constructor
 * @since  0.1.0
 */
Context.prototype.Number = function (i) {
  this._state.override = Number(i);
};

/**
 * Replace `_.template` ouput
 * @method
 * @param {} b Must be acceptable by `Boolean` constructor
 * @since  0.1.0
 */
Context.prototype.Boolean = function (b) {
  this._state.override = Boolean(b);
};

/**
 * Replace `_.template` ouput
 * @method
 * @param {} s Must be acceptable by `String` constructor
 * @since  0.1.0
 */
Context.prototype.String = function (s) {
  this._state.override = String(s);
};

/**
 * Replace `_.template` ouput
 * @method
 * @param {} d Must be acceptable by `Date` constructor
 * @since  0.1.0
 */
Context.prototype.Date = function (d) {
  this._state.override = new Date(d);
};

/**
 * Replace `_.template` ouput
 * @method
 * @param {} i Must be acceptable by `Long` constructor in bson package
 * @see  {@link https://github.com/mongodb/js-bson|bson}
 * @since  0.1.0
 */
Context.prototype.NumberLong = function (i) {
  this._state.override = new bson.Long(i);
};

/**
 * Replace `_.template` ouput
 * @method
 * @see  {@link https://github.com/mongodb/js-bson|bson}
 * @since  0.1.0
 */
Context.prototype.MinKey = function () {
  this._state.override = new bson.MinKey();
};

/**
 * Replace `_.template` ouput
 * @method
 * @see  {@link https://github.com/mongodb/js-bson|bson}
 * @since  0.1.0
 */
Context.prototype.MaxKey = function () {
  this._state.override = new bson.MaxKey();
};

/**
 * Replace `_.template` ouput
 * @method
 * @see  {@link https://github.com/mongodb/js-bson|bson}
 * @since  0.1.0
 */
Context.prototype.Timestamp = function () {
  this._state.override = new bson.Timestamp();
};

/**
 * Replace `_.template` ouput
 * @method
 * @param {} i Must be acceptable by `ObjectId` constructor in bson package
 * @see  {@link https://github.com/mongodb/js-bson|bson}
 * @since  0.1.0
 */
Context.prototype.ObjectID = function (i) {
  this._state.override = new bson.ObjectId(i);
};

module.exports = Context;
