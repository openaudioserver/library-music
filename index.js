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
    await albums.indexAlbumTracks(library.tracks, library.albums)
    await albums.indexAlbumGenres(library.tracks, library.albums)
    await albums.indexAlbumArtists(library.tracks, library.albums)
    await albums.indexAlbumComposers(library.tracks, library.albums)
    console.log('[indexer]', 'indexing persons information')
    await credits.indexComposerTracks(library.tracks, library.credits)
    await credits.indexComposerGenres(library.tracks, library.credits)
    await credits.indexComposerAlbums(library.albums, library.credits)
    console.log('[indexer]', 'indexing genre information')
    await genres.indexGenreAlbums(library.albums, library.genres)
    await genres.indexGenreTracks(library.tracks, library.genres)
    await genres.indexGenreComposers(library.tracks, library.genres)
    await genres.indexGenreArtists(library.tracks, library.genres)
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
