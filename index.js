const albums = require('./scan/albums.js')
const genres = require('./scan/genres.js')
const credits = require('./scan/credits.js')
const tracks = require('./scan/tracks.js')

module.exports = {
  scan: async (library) => {
    console.log('[music-indexer]', 'scanning tracks')
    await tracks.scan(library)
    if (!library.tracks.length) {
      return console.log('[indexer]', 'no tracks in library')
    }
    console.log('[music-indexer]', 'scanning albums')
    await albums.scan(library)
    console.log('[music-indexer]', 'scanning genres')
    await genres.scan(library)
    console.log('[music-indexer]', 'scanning credits')
    await credits.scan(library)
  },
  load: async (library) => {
    if (!library.tracks) {
      return console.log('[indexer]', 'no tracks in library')
    }
    console.log('[indexer]', 'indexing album information')
    await albums.indexTracks(library)
    await albums.indexGenres(library)
    await albums.indexCredits(library)
    console.log('[indexer]', 'indexing genre information')
    await genres.indexAlbums(library)
    await genres.indexTracks(library)
    await genres.indexCredits(library)
    console.log('[indexer]', 'indexing persons information')
    await credits.indexTracks(library)
    await credits.indexGenres(library)
    await credits.indexAlbums(library)
    library.api.albums = {
      get: require('./api/albums.get.js'),
      list: require('./api/albums.list.js')
    }
    library.api.tracks = {
      get: require('./api/tracks.get.js'),
      list: require('./api/tracks.list.js')
    }
    library.api.genres = {
      get: require('./api/genres.get.js'),
      list: require('./api/genres.list.js')
    }
    library.api.persons = {
      get: require('./api/persons.get.js'),
      list: require('./api/persons.list.js')
    }
  }
}
