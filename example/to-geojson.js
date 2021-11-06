var lpb = require('length-prefixed-buffers')
var toGeoJSON = require('../to-geojson')
var decoded = toGeoJSON(lpb.decode(Buffer.from(
  'AT0DxwUABgAAIEEAAKBBAADwQQAAIEIAAEhCAAAAAAAAAAAAAEhCAAAgQgAAXEIAAKBBAAAMQgIBAAIEAwUA',
  'base64'
)))
console.log(JSON.stringify(decoded))
