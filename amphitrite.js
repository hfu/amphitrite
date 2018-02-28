const Database = require('better-sqlite3')
const VectorTile = require('@mapbox/vector-tile').VectorTile
const Protobuf = require('pbf')
const zlib = require('zlib')
const params = {
  src: '/export/experimental_fgd.mbtiles', Z: 18,
  z: 10, x: 881, y: 413
}

const lut = {
  'Cstline': f => {
    return {layer: 'cstline', minzoom: 10, maxzoom: 16}
  },
  'Cntr': f => {
    return {
      layer: 'cntr', 
      minzoom: f.properties.alti % 100 === 0 ? 10 : 
        (f.properties.alti % 50 === 0 ? 13 : 15),
      maxzoom: 16
    }
  },
  'RdEdg': f => {
    return {layer: 'rdedg', minzoom: 14, maxzoom: 16}
  },
  'ElevPt': f => {
    return {layer: 'elevpt', minzoom: 15, maxzoom: 16}
  },
  'BldL': f => {
    return {layer: 'bldl', minzoom: 16, maxzoom: 16}
  },
  'GCP': f => {
    return {layer: 'gcp', minzoom: 16, maxzoom: 16}
  },
  'WL': f => {
    return {layer: 'wl', minzoom: 14, maxzoom: 16}
  },
  'AdmPt': f => {
    return {layer: 'admpt', minzoom: 16, maxzoom: 16}
  },
  'RdCompt': f => {
    return {layer: 'rdcompt', minzoom: 16, maxzoom: 16}
  },
  'CommBdry': f => {
    return {layer: 'commbdry', minzoom: 15, maxzoom: 16}
  },
  'AdmBdry': f => {
    return {layer: 'admbdry', minzoom: 13, maxzoom: 16}
  },
  'WStrL': f => {
    return {layer: 'wstrl', minzoom: 14, maxzoom: 16}
  },
  'CommPt': f => {
    return {layer: 'commpt', minzoom: 15, maxzoom: 16}
  },
  'RailCL': f => {
    return {layer: 'railcl', minzoom: 13, maxzoom: 16}
  },
  'SBBdry': f => {
    return {layer: 'sbbdry', minzoom: 15, maxzoom: 16}
  },
  'SBAPt': f => {
    return {layer: 'sbapt', minzoom: 16, maxzoom: 16}
  }
}

const db = new Database(params.src, {readonly: true})
const dz = params.Z - params.z
const stmt = db.prepare(
  'SELECT * FROM tiles WHERE tile_row = ? AND tile_column = ? AND zoom_level = ?'
)
for (let x = params.x << dz; x < (params.x + 1) << dz; x++) {
  for (let y = params.y << dz; y < (params.y + 1) << dz; y++) {
    for (const r of stmt.iterate((1 << params.Z) - y - 1, x, params.Z)) {
      const json = JSON.parse(zlib.gunzipSync(r.tile_data))
      for(let f of json.features) {
        f.tippecanoe = lut[f.properties.class](f)
        f.properties = {}
        console.log(JSON.stringify(f))
      }
    }
  }
}
