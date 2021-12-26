var pclip = require('pclip')
var geo = require('pclip/geo')
var { inspect } = require('util')

module.exports = function (grid, feature) {
  var opts = Object.assign({ get }, geo)
  var g = feature.geometry
  if (g.type === 'Line') {
  } else if (g.type === 'MultiLine') {
  } else if (g.type === 'Polygon' || g.type === 'MultiPolygon') {
    var cs = pclip.divide(grid, g.coordinates, opts)
    var features = []
    for (var i = 0; i < grid.length; i++) {
      var coordinates = [], edges = []
      for (var j = 0; j < cs.length; j++) {
        if (polygonInPolygon(grid[i], cs[j])) {
          coordinates.push(getCoords(cs[j]))
          edges.push(getEdges(cs[j]))
        }
      }
      if (coordinates.length > 0) {
        features.push({
          type: 'Feature',
          properties: feature.properties,
          geometry: {
            type: 'MultiPolygon',
            coordinates,
            edges,
          }
        })
      }
    }
    return {
      type: 'FeatureCollection',
      features,
    }
  }
}

function get(nodes, i) { return nodes[i] }
function show(...args) {
  console.error(args.map(x => inspect(x, { depth: null })).join(' '))
}

function getCoords(rings) {
  var coords = []
  for (var i = 0; i < rings.length; i++) {
    var ring = rings[i]
    var lp = ring.length
    var cs = []
    if (geo.distance(ring[0],ring[ring.length-1]) < 1e-8) lp--
    for (var j = 0; j < lp; j++) {
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
    var lp = ring.length
    if (geo.distance(ring[0],ring[ring.length-1]) < 1e-8) lp--
    for (var j = 0; j < lp; j++) {
      var n = ring[j]
      if (n.intersect && n.entry) continue
      edges.push([index+j, index+(j+1)%lp])
    }
    index += rings[i].length
  }
  return edges
}

function polygonInPolygon(g,rings) {
  var pip = geo.pointInPolygon, dist = geo.distance
  if (!ringInsideRings(pip, rings[0], g, 1e-8, dist)) return false
  for (var j = 1; j < rings.length; j++) {
    if (ringInsideRings(pip, rings[j], g, 1e-8, dist)) return false
  }
  return true
}

function ringInsideRings(pip, ring, P, epsilon, distance) {
  // find first point in ring not equal to any point in P
  for (var i = 0; i < ring.length; i++) {
    J: for (var j = 0; j < P.length; j++) {
      for (var k = 0; k < P[j].length; k++) {
        if (distance(ring[i],P[j][k]) <= epsilon) {
          break J
        }
      }
    }
    if (j === P.length) break
  }
  if (i === ring.length) return true // same ring
  if (!pip(ring[i], P[0])) return false
  for (var j = 1; j < P.length; j++) {
    if (pip(ring[i],P[j])) return false
  }
  return true
}
