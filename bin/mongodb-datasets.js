#!/usr/bin/env node

var md = require('../');
var argv = require('minimist')(process.argv.slice(2));
var es = require('event-stream');
var fs = require('fs');

console.log(argv);

fs.createReadStream('../examples/me_in_a_nutshell.json')
  .pipe(md.createGeneratorStream(argv))
  .pipe(es.map(function (data, callback) {
    callback(JSON.stringify(data, null, 2));
  }))
  .pipe(process.stdout);

// fs.createReadStream('./examples/me_in_a_nutshell.json')
//   .pipe(md.createGeneratorStream(argv))
//   .pipe(md.createPopulatorStream(argv));
