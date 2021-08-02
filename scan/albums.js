function normalize (text) {
  return text.toLowerCase().replace(/[\W_]+/g, ' ').trim()
}

module.exports = {
  scan: scanAlbums,
  indexAlbumTracks,
  indexAlbumGenres,
  indexAlbumPersons
}

async function scanAlbums (library) {
  library.albums = []
  const albumIndex = []
  await Promise.all(library.track.map(async track => {
    if (!track.album) {
      return
    }
    const key = normalize(track.artists) + normalize(track.album)
    if (albumIndex.indexOf(key) === -1) {
      albumIndex.push(key)
      library.albums.push({
        type: 'album',
        id: `album_${library.albums.length}`,
        name: track.album,
        nameSort: track.albumsort || track.album,
        artist: track.albumartist || track.artist,
        year: track.year,
        compilation: track.compilation,
        totaldiscs: track.totaldiscs
      })
    }
  }))
}

async function indexAlbumTracks (media, albums, index) {
  for (const album of albums) {
    album.tracks = []
    const tracks = media.filter(track => track.albumid === album.id)
    for (const track of tracks) {
      album.tracks.push(track.id)
    }
  }
}

async function indexAlbumGenres (media, albums, index) {
  for (const album of albums) {
    album.genres = []
    for (const trackid of album.tracks) {
      const track = index[trackid]
      if (!track.genres) {
        continue
      }
      for (const genreid of track.genres) {
        if (album.genres.indexOf(genreid) === -1) {
          album.genres.push(genreid)
        }
      }
    }
  }
}

async function indexAlbumPersons (media, albums, index) {
  for (const album of albums) {
    album.composers = []
    for (const trackid of album.tracks) {
      const track = index[trackid]
      if (!track.composers) {
        continue
      }
      for (const composerid of track.composers) {
        if (album.composers.indexOf(composerid) === -1) {
          album.composers.push(composerid)
        }
      }
    }
  }
}