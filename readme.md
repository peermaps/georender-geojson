# georender-geojson

convert between the [georender][] format and geojson

[georender]: https://github.com/peermaps/docs/blob/master/georender.md

# example

geojson to georender:

``` js
var lpb = require('length-prefixed-buffers')
var toGeorender = require('georender-geojson/to-georender')
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
```

georender to geojson:

``` js
var lpb = require('length-prefixed-buffers')
var toGeoJSON = require('georender-geojson/to-geojson')
var decoded = toGeoJSON(lpb.decode(Buffer.from(
  'AT0DxwUABgAAIEEAAKBBAADwQQAAIEIAAEhCAAAAAAAAAAAAAEhCAAAgQgAAXEIAAKBBAAAMQgIBAAIEAwUA',
  'base64'
)))
console.log(JSON.stringify(decoded))
```

# api

``` js
var toGeorender = require('georender-geojson/to-georender')
var toGeoJSON = require('georender-geojson/to-geojson')
var { toGeorender, toGeoJSON } = require('georender-geojson')
```

## var buffers = toGeorender(geojson)

Convert an object of `geojson` data into an array of `buffers`.

## var geojson = toGeoJSON(buffers)

Convert an array of `buffers` into an object of `geojson`.

# license

bsd

# install

```
npm install georender-geojson
```
