const MusicMetaData = require('music-metadata')

module.exports = {
  scan: scanSongs
}

async function scanSongs (library) {
  library.songs = []
  for (const file of library.files) {
    if (file.extension !== 'mp3' && file.extension !== 'flac') {
      continue
    }
    let metaData
    try {
      metaData = await MusicMetaData.parseFile(file.path)
    } catch (error) {
      console.error('error reading meta data', file.path, error)
    }
    const song = {
      id: file.id,
      type: 'song',
      duration: metaData.format.duration,
      bitRate: metaData.format.bitrate,
      codec: metaData.format.codec.toLowerCase(),
      fileContainer: metaData.format.container.toLowerCase(),
      sampleRate: metaData.format.container.sampleRate,
      numberOfChannels: metaData.format.container.numberOfChannels,
      lossless: metaData.format.lossless
    }
    for (const key in commonTags) {
      if (metaData.common[key]) {
        if (key === 'picture') {
          song.images = []
          for (const image of metaData.common.picture) {
            song.images.push({
              format: image.format,
              type: image.type,
              size: image.data.length
            })
          }
        } else {
          song[key] = metaData.common[key]
          if (Array.isArray(song[key])) {
            song[key] = song[key].join(', ')
          }
        }
      }
    }
    library.songs.push(song)
  }
}

const commonTags = [
  'track',
  'disk',
  'year',
  'title',
  'artist',
  'artists',
  'albumartist',
  'album',
  'date',
  'originaldate',
  'originalyear',
  'comment',
  'genre',
  'picture',
  'composer',
  'lyrics',
  'albumsort',
  'titlesort',
  'work',
  'artistsort',
  'albumartistsort',
  'composersort',
  'lyricist',
  'writer',
  'conductor',
  'remixer',
  'arranger',
  'engineer',
  'technician',
  'producer',
  'djmixer',
  'mixer',
  'publisher',
  'label',
  'grouping',
  'subtitle',
  'discsubtitle',
  'totaltracks',
  'totaldiscs',
  'compilation',
  'rating',
  'bpm',
  'mood',
  'media',
  'catalognumber',
  'tvShow',
  'tvShowSort',
  'tvEpisode',
  'tvEpisodeId',
  'tvNetwork',
  'tvSeason',
  'podcast',
  'podcasturl',
  'releasestatus',
  'releasetype',
  'releasecountry',
  'script',
  'language',
  'copyright',
  'license',
  'encodedby',
  'encodersettings',
  'gapless',
  'barcode',
  'isrc',
  'asin',
  'musicbrainz_recordingid',
  'musicbrainz_trackid',
  'musicbrainz_albumid',
  'musicbrainz_artistid',
  'musicbrainz_albumartistid',
  'musicbrainz_releasegroupid',
  'musicbrainz_workid',
  'musicbrainz_trmid',
  'musicbrainz_discid',
  'acoustid_id',
  'acoustid_fingerprint',
  'musicip_puid',
  'musicip_fingerprint',
  'website',
  'performer:instrument',
  'peakLevel',
  'averageLevel',
  'notes',
  'key',
  'originalalbum',
  'originalartist',
  'discogs_artist_id',
  'discogs_label_id',
  'discogs_master_release_id',
  'discogs_rating',
  'discogs_release_id',
  'discogs_votes',
  'replaygain_track_gain',
  'replaygain_track_peak',
  'replaygain_album_gain',
  'replaygain_album_peak',
  'replaygain_track_minmax',
  'replaygain_album_minmax',
  'replaygain_undo',
  'description',
  'longDescription',
  'category',
  'hdVideo',
  'keywords',
  'movement',
  'movementIndex',
  'movementTotal',
  'podcastId',
  'showMovement',
  'stik'
]
