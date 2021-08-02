module.exports = {
  scan: scanGenres,
  indexGenreAlbums,
  indexGenrePersons,
  indexGenreTracks
}

function normalize (text) {
  return text.toLowerCase().replace(/[\W_]+/g, ' ').trim()
}

async function scanGenres (library) {
  const uniqueKeys = []
  library.genres = []
  for (const track of library.tracks) {
    if (!track.genres || !track.genres.length) {
      continue
    }
    const genres = track.genres.split(',')
    for (const i in genres) {
      const name = genres[i]
      const genre = await processGenre(library, name, uniqueKeys)
      if (genre) {
        library.genres.push(genre)
      }
    }
  }
}

async function processGenre (library, name, uniqueKeys) {
  const key = normalize(name)
  const existingIndex = uniqueKeys.indexOf(key)
  if (existingIndex === -1) {
    uniqueKeys.push(key)
    return {
      type: 'genre',
      id: `genre_${library.genres.length}`,
      name,
      displayName: name,
      sortName: name
    }
  }
}

async function indexGenreTracks (media, genres) {
  for (const genre of genres) {
    genre.tracks = []
    const tracks = media.filter(track => track.genres && track.genres.indexOf(genre.id) > -1)
    for (const track of tracks) {
      genre.tracks.push(track.id)
    }
  }
}

async function indexGenrePersons (media, genres, index) {
  for (const genre of genres) {
    genre.composers = []
    for (const trackid of genre.tracks) {
      const track = index[trackid]
      if (!track.composers) {
        continue
      }
      for (const composerid of track.composers) {
        if (genre.composers.indexOf(composerid) === -1) {
          genre.composers.push(composerid)
        }
      }
    }
  }
}

async function indexGenreAlbums (albums, genres) {
  for (const genre of genres) {
    genre.albums = []
    for (const album of albums) {
      if (!album.genres || album.genres.indexOf(genre.id) === -1) {
        continue
      }
      genre.albums.push(album.id)
    }
  }
}
