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
  return text.toLowerCase().replace(/[\W_]+/g, ' ').trim()
}

async function scanPersons (library) {
  const uniqueKeys = []
  library.persons = []
  library.personCategories = []
  for (const track of library.tracks) {
    for (const type of personTypes) {
      if (!track[type] || !track[type].length) {
        continue
      }
      const nameList = track[type].split(';').join(',').split('/').join(',')
      const names = nameList.split(',')
      for (const i in names) {
        const name = names[i]
        const person = await processPerson(library, name, uniqueKeys)
        if (person) {
          library.persons.push(person)
        }
      }
    }
  }
}

async function processPerson (library, name, uniqueKeys) {
  const key = normalize(name)
  const existingIndex = uniqueKeys.indexOf(key)
  if (existingIndex === -1) {
    return {
      type: 'person',
      id: `person_${library.personTypes.length}`,
      name
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
