function normalize (text) {
  return text.toLowerCase().replace(/[\W_]+/g, ' ')
}

module.exports = {
  scan: scanAlbums,
  indexAlbumSongs,
  indexAlbumGenres,
  indexAlbumPersons
}

async function scanAlbums (library) {
  library.albums = []
  const albumIndex = []
  for (const song of library.songs) {
    if (!song.album) {
      continue
    }
    const key = normalize(song.artists) + normalize(song.album)
    if (albumIndex.indexOf(key) === -1) {
      albumIndex.push(key)
      library.albums.push({
        type: 'album',
        id: `album_${library.albums.length}`,
        name: song.album,
        nameSort: song.albumsort || song.album,
        artist: song.albumartist || song.artist,
        year: song.year, 
        compilation: song.compilation,
        totaldiscs: song.totaldiscs
      })
    }
  }
}

async function indexAlbumSongs (media, albums, index) {
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