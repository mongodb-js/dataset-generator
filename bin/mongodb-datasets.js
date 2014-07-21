#!/usr/bin/env node

var md = require('../');
var helpers = require('../lib/helpers');
var argv = require('minimist')(process.argv.slice(2));
var es = require('event-stream');
var fs = require('fs');
var stream = require('stream');

var myOpts = helpers.filterOptions(argv, md.DEFAULT_OPTIONS.cli);
var genOpts = helpers.filterOptions(argv, md.DEFAULT_OPTIONS.generator);
var popOpts = helpers.filterOptions(argv, md.DEFAULT_OPTIONS.populator);

// console.log('All commands: ', argv);
// console.log('For this script: ', myOpts);
// console.log('For Generator: ', genOpts);
// console.log('For Populator: ', popOpts);

(myOpts.path ? fs.createReadStream(myOpts.path) : process.stdin)
  .pipe(md.createGeneratorStream(genOpts))
  .pipe(myOpts.populate ? md.createPopulatorStream(popOpts)
                        : new stream.PassThrough({objectMode: true}))
  .pipe(es.map(function (data, callback) {
    if (myOpts.raw) {
      callback(null, JSON.stringify(data));
    } else {
      callback(null, JSON.stringify(data, null, 2));
    }
  }))
  .pipe(process.stdout);
  // .pipe(myOpts.display ? process.stdout
                       // : new stream.PassThrough({objectMode: true}));
