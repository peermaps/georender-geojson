const encode = require('georender-pack/encode')

module.exports = encodeDynamic
module.exports.collection = encodeCollection
module.exports.feature = encodeFeature

function encodeDynamic(obj, opts) {
  if (!obj) return []
  else if (obj.type === 'FeatureCollection') {
    return encodeCollection(obj, opts)
  } else {
    return encodeFeature(obj, opts)
  }
}

function encodeCollection(fc, opts) {
  if (!fc || fc.type !== 'FeatureCollection') return []
  return (fc.features || []).flatMap(feature => encodeFeature(feature, opts))
}

function encodeFeature(feature, opts) {
  var propertyMap = opts && opts.propertyMap || identity
  if (!feature || feature.type !== 'Feature') return []
  var g = feature.geometry
  if (!g || !Array.isArray(g.coordinates)) return []
  var props = propertyMap(feature.properties || {}, feature)
  if (g.type === 'Point') {
    return [ encode({
      type: 'node',
      tags: props,
      id: props.id || 0,
      lon: g.coordinates[0],
      lat: g.coordinates[1],
    }) ]
  } else if (g.type === 'MultiPoint') {
    return g.coordinates.map(p => encode({
      type: 'node',
      tags: props,
      id: props.id || 0,
      lon: p[0],
      lat: p[1],
    }))
  } else if (g.type === 'LineString') {
    var cs = g.coordinates
    var deps = new Array(cs.length)
    var refs = new Array(cs.length)
    for (var i = 0; i < cs.length; i++) {
      deps[i] = { lon: cs[i][0], lat: cs[i][1] }
      refs[i] = i
    }
    return [ encode({
      type: 'way',
      tags: props,
      id: props.id || 0,
      refs,
    }, deps) ]
  } else if (g.type === 'MultiLineString') {
    return g.coordinates.map(cs => {
      var deps = new Array(cs.length)
      var refs = new Array(cs.length)
      for (var i = 0; i < cs.length; i++) {
        deps[i] = { lon: cs[i][0], lat: cs[i][1] }
        refs[i] = i
      }
      return encode({
        type: 'way',
        tags: props,
        id: props.id || 0,
        refs,
      }, deps)
    })
  } else if (g.type === 'Polygon') {
    var rings = g.coordinates
    var deps = {}
    var members = []
    var id = 1
    for (var i = 0; i < rings.length; i++) {
      var cs = rings[i]
      if (cs.length === 0) continue
      var wayId = id++
      members.push({
        type: 'way',
        role: i === 0 ? 'outer' : 'inner',
        id: wayId,
      })
      var refs = []
      var firstId = id
      for (var j = 0; j < cs.length; j++) {
        if (j === cs.length-1 && approxEq(cs[0], cs[j])) continue
        refs.push(id)
        deps[id] = { lon: cs[j][0], lat: cs[j][1] }
        id++
      }
      refs.push(firstId)
      deps[wayId] = { type: 'way', id: wayId, refs }
    }
    return [ encode({
      type: 'relation',
      tags: Object.assign({}, props, { type: 'multipolygon' }),
      id: props.id || 0,
      members,
    }, deps) ]
  } else if (g.type === 'MultiPolygon') {
    var mrings = g.coordinates
    var deps = []
    var members = []
    var id = 1
    for (var k = 0; k < mrings.length; k++) {
      var rings = mrings[k]
      for (var i = 0; i < rings.length; i++) {
        var cs = rings[i]
        if (cs.length === 0) continue
        var wayId = id++
        members.push({
          type: 'way',
          role: i === 0 ? 'outer' : 'inner',
          id: wayId,
        })
        var refs = []
        var firstId = id
        for (var j = 0; j < cs.length; j++) {
          if (j === cs.length-1 && approxEq(cs[0], cs[j])) continue
          refs.push(id)
          deps[id] = { lon: cs[j][0], lat: cs[j][1] }
          id++
        }
        refs.push(firstId)
        deps[wayId] = { type: 'way', id: wayId, refs }
      }
    }
    return [ encode({
      type: 'relation',
      tags: Object.assign({}, props, { type: 'multipolygon' }),
      id: props.id || 0,
      members,
    }, deps) ]
  } else {
    return []
  }
}

function approxEq(a,b) {
  var epsilon = 1e-7
  return Math.abs(a[0]-b[0]) < epsilon && Math.abs(a[1]-b[1]) < epsilon
}

function identity(x) { return x }
