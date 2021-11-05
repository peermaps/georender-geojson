const test = require('tape')
const decode = require('../decode.js')
const encode = require('../encode.js')

test(function (t) {
  var decoded = decode(encode({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[[1,2],[3,4],[5,0],[1,2]]],
        },
      }
    ],
  }))
  t.deepEqual(decoded, {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { place: 'other' },
        geometry: {
          type: "Polygon",
          coordinates: [[[1,2],[3,4],[5,0],[1,2]]],
        },
      }
    ],
  })
  t.end()
})
