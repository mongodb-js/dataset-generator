var _ = require('underscore');

// parse the user array
module.exports.demuxArray = function (array) {
  if (!Array.isArray(array) || array.length === 0) {
    return {
      isArray: false
    };
  }
  var num = function () { return _.random(1, 3); };
  if (array.length > 1) {
    var userNum = _.first(array);
    if (typeof userNum === 'number') {
      num = function () { return userNum; };
    } else {
      num = function () { return Number(_.template(userNum)()); };
    }
  }
  return {
    isArray: true,
    num: num
  };
};
