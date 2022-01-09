#!/usr/bin/env node

var minimist = require('minimist')
var argv = minimist(process.argv.slice(2), {
  alias: {
    t: ['tag','tags'],
    f: 'format',
    o: 'outfile',
    h: 'help'
  }
})
if (argv.help) return usage()

var encode = require('./to-georender.js')
var decode = require('./to-geojson.js')
var JSONStream = require('JSONStream')
var fs = require('fs')
var path = require('path')
var through = require('through2')
var split = require('split2')
var lp = require('length-prefixed-stream')
var { pipeline } = require('stream')

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
var outstream = (argv.outfile ?? '-') === '-'
  ? process.stdout
  : fs.createWriteStream(argv.outfile)

if (cmd === 'encode') {
  var outfmt = null
  if (argv.f === 'base64' || argv.f === 'hex') {
    outfmt = through((buf,enc,next) => {
      next(null, buf.toString(argv.f) + '\n')
    })
  } else if (true || argv.f === 'lp') {
    outfmt = lp.encode()
  }
  var encodeOpts = {}
  if (argv.tags) {
    var tags = {}
    ;[].concat(argv.tags).forEach(function (tag) {
      var [k,v] = tag.split('=')
      tags[k] = v
    })
    encodeOpts.propertyMap = function (props) {
      return Object.assign(props, tags)
    }
  }
  input
    .pipe(JSONStream.parse('features.*'))
    .pipe(through.obj(function (feature,enc,next) {
      var bufs = encode(feature, encodeOpts)
      for (var i = 0; i < bufs.length; i++) {
        this.push(bufs[i])
      }
      next()
    }))
    .pipe(outfmt)
    .pipe(outstream)
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
  } else if (true || argv.f === 'lp') {
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
    .pipe(outstream)
} else {
  usage()
}

function usage() {
  console.log(`
    usage: georender-to-geojson [FILE] {OPTIONS}
    usage: geojson-to-georender [FILE] {OPTIONS}
    usage: georender-geojson encode [FILE] {OPTIONS}
    usage: georender-geojson decode [FILE] {OPTIONS}

    Convert between georender and geojson formats:
    geojson to georender (encode) or georender to geojson (decode)

      -t --tag      For encoding, set a key=value as a tag.
      -f --format   Input or output format: hex, base64, or lp (default).
      -o --outfile  Write output to file or "-" for stdout (default).
      -h --help     Show this message.

  `.trim().replace(/^ {4}/gm,'') + '\n')
}
