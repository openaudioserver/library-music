const albums = require('./scan/albums.js')
const genres = require('./scan/genres.js')
const persons = require('./scan/persons.js')
const songs = require('./scan/songs.js')

module.exports = {
  scan: async (library) => {
    console.log('[music-indexer]', 'scanning songs')
    await songs.scan(library)
    console.log('[music-indexer]', 'scanning albums')
    await albums.scan(library)
    console.log('[music-indexer]', 'scanning genres')
    await genres.scan(library)
    console.log('[music-indexer]', 'scanning persons')
    await persons.scan(library)
  },
  load: async (library) => {
    console.log('[indexer]', 'albums', library.albums.length)
    console.log('[indexer]', 'indexing album information')
    await albums.indexAlbumTracks(library.songs, library.albums)
    await albums.indexAlbumGenres(library.songs, library.albums)
    await albums.indexAlbumArtists(library.songs, library.albums)
    await albums.indexAlbumComposers(library.songs, library.albums)
    console.log('[indexer]', 'indexing persons information')
    await persons.indexComposerTracks(library.songs, library.persons)
    await persons.indexComposerGenres(library.songs, library.persons)
    await persons.indexComposerAlbums(library.albums, library.persons)
    console.log('[indexer]', 'indexing genre information')
    await genres.indexGenreAlbums(library.albums, library.genres)
    await genres.indexGenreTracks(library.songs, library.genres)
    await genres.indexGenreComposers(library.songs, library.genres)
    await genres.indexGenreArtists(library.songs, library.genres)
    library.api.albums = {
      get: require('./api/albums.get.js'),
      list: require('./api/albums.list.js')
    }
    library.api.songs = {
      get: require('./api/songs.get.js'),
      list: require('./api/songs.list.js')
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
