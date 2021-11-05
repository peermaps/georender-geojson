const test = require('tape')
const decode = require('../decode.js')
const encode = require('../encode.js')

test('decode encode simple', function (t) {
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

test('decode encode holes', function (t) {
  var decoded = decode(encode({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [[10,20],[30,40],[50,0],[10,20]],
            [[15,21],[25,22],[34,19],[15,21]],
          ],
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
          coordinates: [
            [[10,20],[30,40],[50,0],[10,20]],
            [[15,21],[25,22],[34,19],[15,21]],
          ],
        },
      }
    ],
  })
  t.end()
})
