var lpb = require('length-prefixed-buffers')
var toGeorender = require('../to-georender')
var encoded = toGeorender({
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
})
process.stdout.write(lpb.from(encoded))
