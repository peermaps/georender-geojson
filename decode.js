const features = require('georender-pack/features.json')
const decode = require('georender-pack/decode')

module.exports = function (buffers) {
  var decoded = decode(Array.isArray(buffers) ? buffers : [buffers])
  var prevId = null, prevIndex = 0
  var features = []
  var ring = []
  var coordinates = [ring]
  var ringStart = 0
  var edgeCounts = getEdgeCounts(decoded.area.cells)
  for (var i = 0; i < decoded.area.ids.length; i++) {
    var id = decoded.area.ids[i]
    if ((i > 0 && id !== prevId) || i === decoded.area.ids.length-1) {
      // todo: add labels to properties
      features.push({
        type: 'Feature',
        properties: getFeatureType(decoded.area.types[i-1]),
        geometry: {
          type: 'Polygon',
          coordinates
        }
      })
      ring = []
      coordinates = [ring]
      ringStart = i
      prevIndex = i
    }
    if (i > 0 && decoded.area.ids[i+1] === id && edgeCounts[edgeKey(i,i+1)] !== 1) {
      ring = []
      coordinates.push(ring)
    }
    ring.push([decoded.area.positions[i*2+0], decoded.area.positions[i*2+1]])
    prevId = id
  }
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
