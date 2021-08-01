const personTypes = [
  'artist',
  'artists',
  'person',
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
  'label'
]

module.exports = {
  scan: scanPersons,
  indexPersonAlbums,
  indexPersonGenres,
  indexPersonTracks,
  personTypes
}

function normalize (text) {
  return text.toLowerCase().replace(/[\W_]+/g, ' ')
}

async function scanPersons (library) {
  const uniquePersons = []
  library.personTypes = []
  for (const song of library.songs) {
    for (const type of personTypes) {
      if (!song[type] || !song[type].length) {
        continue
      }
      const nameList = song[type].split(';').join(',').split('/').join(',')
      const names = nameList.split(',')
      for (const i in names) {
        const name = names[i]
        const key = normalize(names[i])
        const existingIndex = uniquePersons.indexOf(key)
        let person
        if (existingIndex === -1) {
          person = {
            type: 'person',
            id: `person_${library.personTypes.length}`,
            name,
            credits: [type]
          }
          names[i] = person.id
          library[type].push(person)
        } else {
          person = library.personTypes[existingIndex]
          if (person.credits.indexOf(type) === -1) {
            person.credits.push(type)
          }
          names[i] = person.id
        }
      }
      song[type] = names
    }
  }
}


async function indexPersonTracks (media, personTypes) {
  for (const person of personTypes) {
    person.tracks = []
    const tracks = media.filter(track => track.personTypes.indexOf(person.id) > -1)
    for (const track of tracks) {
      person.tracks.push(track.id)
    }
  }
}

async function indexPersonGenres (media, personTypes, index) {
  for (const person of personTypes) {
    person.genres = []
    for (const trackid of person.tracks) {
      const track = index[trackid]
      if (!track.genres) {
        continue
      }
      for (const genreid of track.genres) {
        if (person.genres.indexOf(genreid) === -1) {
          person.genres.push(genreid)
        }
      }
    }
  }
}

async function indexPersonAlbums (albums, personTypes) {
  for (const person of personTypes) {
    person.albums = []
    for (const album of albums) {
      if (!album.personTypes || album.personTypes.indexOf(person.id) === -1) {
        continue
      }
      person.albums.push(album.id)
    }
  }
}
