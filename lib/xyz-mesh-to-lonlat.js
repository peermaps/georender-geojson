var toLonLat = require('./to-lonlat.js')

module.exports = function (mesh) {
  var features = []
  for (var i = 0; i < mesh.cells.length; i++) {
    var c0 = mesh.cells[i][0]
    var c1 = mesh.cells[i][1]
    var c2 = mesh.cells[i][2]
    var p0 = toLonLat([0,0], mesh.positions[c0])
    var p1 = toLonLat([0,0], mesh.positions[c1])
    var p2 = toLonLat([0,0], mesh.positions[c2])
    features.push([[p0,p1,p2]])
  }
  return features
}
