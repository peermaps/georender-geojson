const test = require('tape')
const toGeorender = require('../to-georender.js')
const toGeoJSON = require('../to-geojson.js')

test('decode encode simple', function (t) {
  var decoded = toGeoJSON(toGeorender({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[1,2],[3,4],[5,0],[1,2]]],
        },
      }
    ],
  }))
  t.deepEqual(decoded, {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { place: 'other' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[1,2],[3,4],[5,0],[1,2]]],
        },
      }
    ],
  })
  t.end()
})

test('decode encode hole', function (t) {
  var decoded = toGeoJSON(toGeorender({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [[10,20],[30,40],[50,0],[10,20]],
            [[15,21],[25,22],[34,19],[15,21]],
          ],
        },
      }
    ],
  }))
  t.deepEqual(decoded, {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { place: 'other' },
        geometry: {
          type: 'Polygon',
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

test('decode encode multipolygon', function (t) {
  var decoded = toGeoJSON(toGeorender({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [[10,20],[30,40],[50,0],[10,20]]
            ],
            [
              [[0,50],[40,55],[20,35],[0,50]]
            ],
          ],
        },
      }
    ],
  }))
  t.deepEqual(decoded, {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { place: 'other' },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [[10,20],[30,40],[50,0],[10,20]]
            ],
            [
              [[0,50],[40,55],[20,35],[0,50]]
            ],
          ],
        },
      }
    ],
  })
  t.end()
})
