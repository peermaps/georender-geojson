#!/usr/bin/env node
var encode = require('./encode.js')
var decode = require('./decode.js')
var JSONStream = require('JSONStream')
var minimist = require('minimist')
var fs = require('fs')
var path = require('path')
var through = require('through2')
var split = require('split2')
var lp = require('length-prefixed-stream')
var { pipeline } = require('stream')

var argv = minimist(process.argv.slice(2))
var cmd = path.basename(process.argv[1])
if (cmd === 'georender-to-geojson') {
  cmd = 'decode'
} else if (cmd === 'geojson-to-georender') {
  cmd = 'encode'
} else {
  cmd = argv._.shift()
}

var infile = argv._[0] ?? '-'
var input = infile === '-' ? process.stdin : fs.createReadStream(infile)

if (cmd === 'encode') {
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
} else if (cmd === 'decode') {
  var infmt = null
  if (argv.f === 'base64' || argv.f === 'hex') {
    infmt = pipeline(
      split(),
      through.obj(function (buf, enc, next) {
        next(null, Buffer.from(buf.toString(), argv.f))
      }),
      function (err) { console.error(err) }
    )
  } else {
    infmt = lp.decode()
  }
  input
    .pipe(infmt)
    .pipe(through.obj(function (buf, enc, next) {
      var features = decode(buf).features
      for (var i = 0; i < features.length; i++) {
        this.push(features[i])
      }
      next()
    }))
    .pipe(JSONStream.stringify(
      '{"type": "FeatureCollection", "features": [\n',
      ',\n',
      '\n]}\n'
    ))
    .pipe(process.stdout)
}
