const creditCategories = [
  'artist',
  'artists',
  'credit',
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
  scan: scanCredits,
  indexAlbums,
  indexGenres,
  indexTracks,
  creditCategories
}

function normalize (text) {
  return text.toLowerCase().replace(/[\W_]+/g, '').trim()
}

async function scanCredits (library) {
  const uniqueKeys = []
  library.credits = []
  library.creditCategories = []
  for (const track of library.tracks) {
    console.log(track)
    for (const type of creditCategories) {
      if (!track[type] || !track[type].length) {
        continue
      }
      const category = await processCreditCategory(library, type, uniqueKeys)
      let categoryItems = 0
      const nameList = track[type].split(';').join(',').split('/').join(',')
      const names = nameList.split(',')
      for (const i in names) {
        const name = names[i]
        const credit = await processCredit(library, name, uniqueKeys)
        if (credit) {
          library.credits.push(credit)
          categoryItems++
        }
      }
      if (category && categoryItems > 0) {
        library.creditCategories.push(category)
      }
    }
  }
  library.indexArray(library.creditCategories)
  library.indexArray(library.credits)
}

async function processCredit (library, name, uniqueKeys) {
  const key = normalize(name)
  const existingIndex = uniqueKeys.indexOf(key)
  if (existingIndex === -1) {
    uniqueKeys.push(key)
    return {
      type: 'credit',
      id: `credit_${library.credits.length + 1}`,
      name
    }
  }
}

async function processCreditCategory (library, name, uniqueKeys) {
  const existingIndex = uniqueKeys.indexOf(name)
  if (existingIndex === -1) {
    uniqueKeys.push(name)
    return {
      type: 'category',
      id: `category_${library.creditCategories.length}`,
      name
    }
  }
}

async function indexTracks (library) {
  console.log('index tracks')
  for (const credit of library.credits) {
    credit.tracks = []
    const creditKey = normalize(credit.name)
    for (const track of library.tracks) {
      for (const type of creditCategories) {
        if (!track[type]) {
          continue
        }
        const names = track[type].split(',')
        for (const name of names) {
          const key = normalize(name)
          if (key === creditKey) {            
            credit.tracks.push(track.id)
            break
          }
        }
        if (credit.tracks.indexOf(track.id) > -1) {
          break
        }
      }
    }
  }
}

async function indexGenres (library) {
  for (const credit of library.credits) {
    credit.genres = []
    for (const track of library.tracks) {
      if (!track.genres) {
        continue
      }
      for (const genreid of track.genres) {
        if (credit.genres.indexOf(genreid) === -1) {
          credit.genres.push(genreid)
        }
      }
    }
  }
}

async function indexAlbums (library) {
  console.log('index albums')
  for (const credit of library.credits) {
    credit.albums = []
    const normalizedName = normalize(credit.name)
    for (const type of creditCategories) {
      for (const album of library.albums) {
        for (const trackid of album.tracks) {
          const track = await library.getObject(trackid)
          if (!track[type]) {
            continue
          }
          for (const name of track[type]) {
            if (normalizedName === normalize(name)) {
              credit.albums.push(album.id)
              break
            }
          }
          if (credit.albums[credit.albums.length - 1] === album.id) {
            break
          }
        }
        if (credit.albums[credit.albums.length - 1] === album.id) {
          break
        }
      }
    }
  }
}
