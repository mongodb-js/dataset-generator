var main = require('./index');
var argv = require('minimist')(process.argv.slice(2));

console.log(argv);

main(argv, function () {
  console.log('done');
});
