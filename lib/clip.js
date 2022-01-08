var pclip = require('pclip')
var geo = require('pclip/geo')

module.exports = function (grid, feature) {
  var opts = Object.assign({ get }, geo)
  var g = feature.geometry
  if (g.type === 'Line') {
  } else if (g.type === 'MultiLine') {
  } else if (g.type === 'Polygon' || g.type === 'MultiPolygon') {
    var divided = pclip.divide(grid, g.coordinates, opts)
    var features = divided.map(function (rings) {
      return {
        type: 'Feature',
        properties: feature.properties,
        geometry: {
          type: 'Polygon',
          coordinates: getCoords(rings),
          edges: getEdges(rings),
        },
      }
    })
    return { type: 'FeatureCollection', features }
  }
}

function get(nodes, i) { return nodes[i] }

function getCoords(rings) {
  var coords = []
  for (var i = 0; i < rings.length; i++) {
    var ring = rings[i]
    var cs = []
    for (var j = 0; j < ring.length; j++) {
      cs.push(ring[j].point)
    }
    coords.push(cs)
  }
  return coords
}

function getEdges(rings) {
  var edges = []
  var index = 0
  for (var i = 0; i < rings.length; i++) {
    var ring = rings[i]
    for (var j0 = 0; j0 < ring.length; j0++) {
      var j1 = (j+1)%lp
      var n = ring[j0], nn = ring[j1]
      if (n.intersect && nn.intersect) continue
      edges.push([index+j0, index+j1])
    }
    index += rings[i].length
  }
  return edges
}
