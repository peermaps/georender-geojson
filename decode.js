const features = require('georender-pack/features.json')
const decode = require('georender-pack/decode')
const pointInPolygon = require('point-in-polygon')

module.exports = function (buffers) {
  var decoded = decode(Array.isArray(buffers) ? buffers : [buffers])
  var prevId = null, prevIndex = 0
  var features = []
  var ring = []
  var coordinates = [[ring]]
  var ringStart = 0
  var edgeCounts = getEdgeCounts(decoded.area.cells)
  var isMulti = false
  for (var i = 0; i < decoded.area.ids.length; i++) {
    var id = decoded.area.ids[i]
    if (i > 0 && id !== prevId) {
      // todo: add labels to properties
      ring.push([ring[0][0],ring[0][1]])
      features.push({
        type: 'Feature',
        properties: getFeatureType(decoded.area.types[i-1]),
        geometry: {
          type: isMulti ? 'MultiPolygon' : 'Polygon',
          coordinates: isMulti ? coordinates : coordinates[0],
        }
      })
      isMulti = false
      ring = []
      coordinates = [[ring]]
      ring.push([decoded.area.positions[i*2+0], decoded.area.positions[i*2+1]])
      ringStart = i
      prevIndex = i
    } else if (i > 0 && decoded.area.ids[i+1] === id && edgeCounts[edgeKey(i,i+1)] !== 1) {
      var p = [decoded.area.positions[i*2+0], decoded.area.positions[i*2+1]]
      ring.push(p, [ring[0][0],ring[0][1]])
      ring = []
      coordinates[coordinates.length-1].push(ring)
    } else {
      var p = [decoded.area.positions[i*2+0], decoded.area.positions[i*2+1]]
      var cl = coordinates.length
      var c0l = coordinates[cl-1].length
      if (c0l > 1 && ring.length === 0 && !pointInPolygon(p, coordinates[cl-1][0])) {
        coordinates[cl-1].splice(-1)
        ring = []
        coordinates.push([ring])
        isMulti = true
      }
      ring.push(p)
    }
    prevId = id
  }
  ring.push([ring[0][0],ring[0][1]])
  features.push({
    type: 'Feature',
    properties: getFeatureType(decoded.area.types[i-1]),
    geometry: {
      type: isMulti ? 'MultiPolygon' : 'Polygon',
      coordinates: isMulti ? coordinates : coordinates[0],
    }
  })
  return { type: 'FeatureCollection', features }
}

function getFeatureType(type) {
  var parts = features[type].split('.')
  var tags = {}
  tags[parts[0]] = parts[1]
  return tags
}

function getEdgeCounts(cells) {
  var counts = {}
  for (var i = 0; i < cells.length; i+=3) {
    for (var j = 0; j < 3; j++) {
      var e0 = cells[i+j]
      var e1 = cells[i+(j+1)%3]
      var ek = edgeKey(e0,e1)
      counts[ek] = (counts[ek] || 0) + 1
    }
  }
  return counts
}

function edgeKey(e0, e1) {
  return e0 < e1 ? e0+','+e1 : e1+','+e0
}
