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
 */
function Context (host) {
  if (!(this instanceof Context)) return new Context(host);

  /**
   * Expose Chance.js library to clients
   * @method
   * @api public
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
   * @api public
   * @property {function} sample {@link http://underscorejs.org/#sample}
   * @since  0.1.0
   */
  this.util = {
    sample: _.sample
  };

  /**
   * Counter
   * @method
   * @api public
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
   * @api public
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
   * @api public
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
 * @api public
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

// tile 1: heavy aggregation

/**
 * Generate a random number (floating point, or integer)
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {boolean} integer Produce an integer. True by default.
 * @property {boolean} float Produce a floating point number.
 * @property {number} min Lower range of result
 * @property {number} max Upper range of result
 * @property {boolean} fixed Number of decimal digits for floats
 * @property {boolean} natural Natural number, i.e. {min: 0, integer: true}
 * @property {number} dice Roll a dice, i.e. {min: 0, max: arg, integer: true}
 * @property {(boolean|string)} age Return an age.
 *           + `true` - using default range, 0 ~ 120
 *           + `child`, `teen`, `adult`, `senior`
 * @return {number}
 * @since  0.2.0
 *
 * @example
 * // returns, for example, 3404660580810752
 * num();
 * @example
 * // returns, for example, 892547889941708.8
 * num('float', {fixed: 1, min: 0});
 * @example
 * // returns, for example, 19
 * num({age: 'teen'});
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

/**
 * Generate a random name containing prefix, first name, middle name, last name.
 * By default, generate a name without prefix or middle name.
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {string} gender Gender: `male`/`female`
 * @property {boolean} first Only first name
 * @property {boolean} last Only last name
 * @property {(boolean|string)} middle With middle name?
 *           + `true` - middle initial
 *           + `full` - full middle name
 * @property {(boolean|string)} prefix With prefix?
 *           + `true` - short prefix, e.g. "Mr."
 *           + `full` - long prefix, e.g. "Mister"
 * @return {string}
 * @since  0.2.0
 *
 * @example
 * // returns, for example, "Mr. Bruse Morrison"
 * name();
 * @example
 * // returns a random first name
 * name('first');
 * @example
 * // returns, for example, "Mr. Bruce Dale Morrison"
 * name('prefix', {gender: 'male', middle: 'full'});
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

/**
 * Generate a random address containing street address, city, state, zipcode
 * By default, generate a random street address.
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {boolean} array Format the output as an array?
 * @property {string} delimiter Used to join components to a single string.
 *                              Default is " ".
 * @property {(boolean|string)} street Contain street address? True by default.
 *           + `true` - full street name, e.g. "300 Fifth Avenue"
 *           + `short` - short street name, e.g. "300 Fifth Ave"
 * @property {boolean} city With city?
 * @property {(boolean|string)} state Contain state?
 *           + `true` - state initials, e.g. "CA"
 *           + `long` - full state name, e.g. "California"
 * @property {(boolean|string)} zip Contain zipcode?
 *           + `true` - five digit zipcode
 *           + `long` - with extra four digits, e.g. "10011-3444"
 * @property {boolean} full Shortcut to enable all components
 * @return {(string|Array.<string>)}
 * @since  0.2.0
 *
 * @example
 * // returns, for example, "32 Karki Street"
 * address();
 * @example
 * // returns, for example, "32 Karki Street, Keiduciv, CA, 10036"
 * address('full', {delimiter: ', '});
 * @example
 * // returns, for example, [ "32 Karki Street", "Keiduciv" ]
 * address('array', 'city', 'street');
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

/**
 * Generate a random date
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {(boolean|string)} string Return a string instead with format of:
 *           + `true` - short format, i.e. "mm/dd/yyyy"
 *           + `long` - `Date.prototype.toDateString()`, e.g. "Tue Dec 30 2014"
 *           + `json` - `Date.prototype.toJSON()`
 *           + `time` - `Date.prototype.toTimeString()`
 * @property {(boolean|string)} integer Return an integer instead. Options are:
 *           + `true` - return hammertime, `Date.prototype.getTime()`
 *           + year/month/day/hour/min/sec/ms - return the part respectively
 * @property {*} min Lower range, new Date(min) must be a valid date.
 *                   If undefined, new Date() will be used.
 * @property {*} max Lower range, new Date(max) must be a valid date
 *                   If undefined, new Date() will be used.
 * @property {number} year With a fixed year
 * @property {number} month With a fixed month
 * @property {number} day With a fixed day
 * @return {(Date|string)}
 * @since  0.2.0
 */
Context.prototype.date = function () {
  var opts = helpers.mix(arguments);
  var d;
  if (opts.min || opts.max) {
    d = new Date(faker.Date.between(
      opts.min ? new Date(opts.min) : new Date(),
      opts.max ? new Date(opts.max) : new Date()));
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
  return (isNaN(d.valueOf()) ? chance.date() : d);
};

/**
 * Generate a random string.
 * By default, generate a random one-char string.
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {number} length Default is 1
 * @property {string} pool Default is all alphanum and '!@#$%^&*()'
 * @property {string} casing Options are `lower` and `upper`
 * @property {boolean} alpha Only alphanumeric characters
 * @property {boolean} symbol Only symbols
 * @property {boolean} hash Hash. Shortcut for {casing: 'lower', alpha: true}
 * @return {string}
 * @since  0.2.0
 *
 * @example
 * // returns, for example, "g6dnc4rqhi6h"
 * str('hash', {length: 12});
 */
Context.prototype.str = function () {
  var opts = helpers.mix(arguments);
  var p = {}, c = opts.casing ? {casing: opts.casing} : {};
  p = opts.symbol ? {symbols: true} : p;
  p = !opts.alpha ? p :
    {pool: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM1234567890'};
  if (opts.hash) {
    p = {pool: 'qwertyuiopasdfghjklzxcvbnm0123456789'};
  }
  p = opts.pool ? {pool: '' + opts.pool} : p;
  if (!opts.length)
    return chance.character(helpers.mix(p, c));
  var rtn = '';
  for (var i = Number(opts.length); i > 0; i--) {
    rtn += chance.character(helpers.mix(p, c));
  }
  return rtn;
};

/**
 * Generate random credit card information.
 * By default, generate a string of random credit card number.
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {boolean} array Format the output as an array?
 * @property {string} delimiter Used to join components to a single string.
 *                              Default is " ".
 * @property {(boolean|string)} type Contain type of credit card?
 *           + `true` - short name, e.g. 'discover'
 *           + `full` - full name, e.g. 'Discover Card'
 * @property {boolean} num Contain credit card number?
 * @property {boolean} exp Contain expiration date? e.g. '02/2019'
 * @return {(string|Array.<string>)}
 * @since  0.2.0
 *
 * @example
 * // returns, for example, "6011652062950102"
 * cc();
 * @example
 * // returns, for example, "Diners Club International"
 * cc({type: 'full'});
 * @example
 * // returns, for example, [ 'visa', '4174049365395374', '01/2023' ]
 * cc('array', 'type', 'num', 'exp');
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

/**
 * Generate a random text segment.
 * By default, generate one `lorem`-like sentence.
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {number} sentence Generate a paragraph of num sentences
 * @property {number} word Generate a sentence of num words
 * @property {number} syllable Generate a word with num syllables
 * @property {number} char Generate a word with num characters
 * @return {string}
 * @since  0.2.0
 *
 * @example
 * // returns, for example, "fatelu"
 * text({syllable: 3});
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

/**
 * Generate a random ID for different purposes.
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {boolean} guid Generate a guid (default behavior)
 * @property {boolean} fb Generate a facebook ID
 * @property {boolean} twitter Generate a twitter ID
 * @property {boolean} gganl Generate a Google Analytics tracking code
 * @property {boolean} username Generate a plausible username
 * @return {string}
 * @since  0.2.0
 *
 * @example
 * // returns, for example, '9202D6EB-27B4-5DB5-8C20-444CDFB5B32E'
 * id();
 * @example
 * // returns, for example, '1000052961667394'
 * id('fb');
 */
Context.prototype.id = function () {
  var opts = helpers.mix(arguments);
  if (opts.fb) return chance.fbid();
  if (opts.twitter) return chance.twitter();
  if (opts.hashtag) return chance.hashtag();
  if (opts.gganl) return chance.google_analytics();
  if (opts.username) return faker.Internet.userName();
  return chance.guid();
};

/**
 * Generate random coordinates.
 * By default, generate "latitude, longitude".
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {boolean} array Format the output as an array?
 * @property {string} delimiter Used to join components to a single string.
 *                              Default is " ".
 * @property {boolean} lat Only latitude?
 * @property {boolean} lng Only longitude?
 * @property {number} fixed Number of demical digits.
 * @return {(Array.<string>|string)}
 * @since  0.2.0
 *
 * @example
 * // returns, for example, '-75.00988, -37.85036'
 * coordinates();
 * // returns, for example, [ -75.00988, -37.85036 ]
 * coordinates('array');
 * // returns, for example, -75.1
 * coordinates('lat', {fixed: 1});
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

/**
 * Generate a random element from the specified pool.
 * @method
 * @api public
 * @param {string} pool Which pool to use. Options are:
 *        + tld: top level domain, e.g. 'gov', 'com'
 *        + radio: {@link http://chancejs.com/#radio}
 *        + tv: {@link http://chancejs.com/#tv}
 *        + currency: {@link http://chancejs.com/#currency}
 *        + gender, ampm, state, city
 * @return {string}
 * @since  0.2.0
 */
Context.prototype.random = function (pool) {
  // var opts = helpers.mix(pool);
  switch (pool) {
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

/**
 * Generate a random phone number
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {boolean} areacode Only return areacode, e.g. "(510)"
 * @return {string}
 * @since  0.2.0
 *
 * @example
 * // returns, for example, '(622) 941-1923'
 * phone();
 */
Context.prototype.phone = function () {
  var opts = helpers.mix(arguments);
  if (opts.areacode) return chance.areacode();
  return chance.phone();
};

/**
 * Generate a random IP address
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {boolean} v6 Use IPv6
 * @return {string}
 * @since  0.2.0
 *
 * @example
 * // returns, for example, '47.55.14.224'
 * ip();
 */
Context.prototype.ip = function () {
  var opts = helpers.mix(arguments);
  if (opts.v6) return chance.ipv6();
  return chance.ip();
};

// tile 4: no aggregation

/**
 * Generate a random domain
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {string} tld With a fixed a top level domain
 * @return {string}
 * @since  0.2.0
 */
Context.prototype.domain = function () {
  return chance.domain(helpers.mix(arguments));
};

/**
 * Generate a random email
 * @method
 * @api public
 * @param {...Context.OptionHash}
 * @property {string} domain With a fixed domain
 * @return {string}
 * @since  0.2.0
 */
Context.prototype.email = function () {
  return chance.email(helpers.mix(arguments));
};

/**
 * Generate a random color
 * @method
 * @api public
 * @see  {@link http://chancejs.com/#color}
 * @param {...Context.OptionHash}
 * @property {string} format Format of color. Options are hex, shorthex, rgb
 * @property {boolean} greyscale Only grayscale color
 * @return {string}
 * @since  0.2.0
 *
 * @example
 * // returns, for example, '#d67118'
 * color({format: 'hex'});
 */
Context.prototype.color = function () {
  return chance.color(helpers.mix(arguments));
};

/**
 * Generate a random Social Security Number
 * @method
 * @api public
 * @see  {@link http://chancejs.com/#ssn}
 * @param {...Context.OptionHash}
 * @property {boolean} ssnFour Only last four digits
 * @property {boolean} dashes With dashes?
 * @return {string}
 * @since  0.2.0
 */
Context.prototype.ssn = function () {
  var opts = helpers.mix(arguments);
  if (!opts.dashes) opts.dashes = false;
  return chance.ssn(opts);
};

/////////////////////////////////////////
// Constructors of all supported types //
/////////////////////////////////////////

/**
 * Replace `_.template` ouput
 * @method
 * @api public
 * @param {} i Must be acceptable by `Number` constructor
 * @since  0.1.0
 */
Context.prototype.Number = function (i) {
  this._state.override = Number(i);
};

/**
 * Replace `_.template` ouput
 * @method
 * @api public
 * @param {} b Must be acceptable by `Boolean` constructor
 * @since  0.1.0
 */
Context.prototype.Boolean = function (b) {
  this._state.override = Boolean(b);
};

/**
 * Replace `_.template` ouput
 * @method
 * @api public
 * @param {} s Must be acceptable by `String` constructor
 * @since  0.1.0
 */
Context.prototype.String = function (s) {
  this._state.override = String(s);
};

/**
 * Replace `_.template` ouput
 * @method
 * @api public
 * @param {} d Must be acceptable by `Date` constructor
 * @since  0.1.0
 */
Context.prototype.Date = function (d) {
  this._state.override = new Date(d);
};

/**
 * Replace `_.template` ouput
 * @method
 * @api public
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
 * @api public
 * @see  {@link https://github.com/mongodb/js-bson|bson}
 * @since  0.1.0
 */
Context.prototype.MinKey = function () {
  this._state.override = new bson.MinKey();
};

/**
 * Replace `_.template` ouput
 * @method
 * @api public
 * @see  {@link https://github.com/mongodb/js-bson|bson}
 * @since  0.1.0
 */
Context.prototype.MaxKey = function () {
  this._state.override = new bson.MaxKey();
};

/**
 * Replace `_.template` ouput
 * @method
 * @api public
 * @see  {@link https://github.com/mongodb/js-bson|bson}
 * @since  0.1.0
 */
Context.prototype.Timestamp = function () {
  this._state.override = new bson.Timestamp();
};

/**
 * Replace `_.template` ouput
 * @method
 * @api public
 * @param {} i Must be acceptable by `ObjectId` constructor in bson package
 * @see  {@link https://github.com/mongodb/js-bson|bson}
 * @since  0.1.0
 */
Context.prototype.ObjectID = function (i) {
  this._state.override = new bson.ObjectId(i);
};

module.exports = Context;
