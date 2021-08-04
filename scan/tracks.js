const MusicMetaData = require('music-metadata')

module.exports = {
  scan: scanTracks
}

async function scanTracks (library) {
  library.tracks = []
  for (const file of library.files) {
    if (file.extension !== 'mp3' && file.extension !== 'flac') {
      continue
    }
    const track = await processTrack(library, file)
    if (track) {
      library.tracks.push(track)
    }
  }
  library.indexArray(library.tracks)
}

async function processTrack (library, file) {
  let metaData
  try {
    metaData = await MusicMetaData.parseFile(file.path)
  } catch (error) {
    console.error('[music-indexer]', 'error reading meta data', file.path, error)
  }
  const track = {
    id: `track_${library.tracks.length + 1}`,
    type: 'track',
    path: file.path
  }
  for (const key in metaData.common) {
    if (metaData.common[key]) {
      if (key === 'picture') {
        track.images = []
        for (const image of metaData.common.picture) {
          track.images.push({
            format: image.format,
            type: image.type,
            size: image.data.length
          })
        }
      } else {
        track[key] = metaData.common[key]
        if (Array.isArray(track[key])) {
          track[key] = track[key].join(', ')
        } else if (track[key].trim) {
          track[key] = track[key].trim()
        }
      }
    }
  }
  return track
}
