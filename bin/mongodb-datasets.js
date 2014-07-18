#!/usr/bin/env node

var main = require('../');
var argv = require('minimist')(process.argv.slice(2));

console.log(argv);

main.populate(argv, function () {
  console.log('done');
});
