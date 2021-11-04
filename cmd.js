#!/usr/bin/env node
var encode = require('./encode.js')
var JSONStream = require('JSONStream')
var minimist = require('minimist')
var fs = require('fs')
var through = require('through2')
var lp = require('length-prefixed-stream')

var argv = minimist(process.argv.slice(2), {
  default: { '_.0': '-' }
})
var infile = argv._[0]
var input = infile === '-' ? process.stdin : fs.createReadStream(infile)
var outfmt = null
if (argv.f === 'base64' || argv.f === 'hex') {
  outfmt = through((buf,enc,next) => {
    next(null, buf.toString(argv.f) + '\n')
  })
} else {
  outfmt = lp.encode()
}

input
  .pipe(JSONStream.parse('features.*'))
  .pipe(through.obj(function (feature,enc,next) {
    var bufs = encode(feature)
    for (var i = 0; i < bufs.length; i++) {
      this.push(bufs[i])
    }
    next()
  }))
  .pipe(outfmt)
  .pipe(process.stdout)
