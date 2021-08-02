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
    for (const type of creditCategories) {
      if (!track.metaData[type] || !track.metaData[type].length) {
        continue
      }
      const category = await processCreditCategory(library, type, uniqueKeys)
      let categoryItems = 0
      const nameList = track.metaData[type].split(';').join(',').split('/').join(',')
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

async function indexTracks (credits, tracks) {
  for (const credit of credits) {
    credit.tracks = []
    const creditKey = normalize(credit.name)
    for (const track of tracks) {
      for (const type of creditCategories) {
        if (!track.metaData[type]) {
          continue
        }
        const names = track.metaData[type].split(',')
        for (const name of names) {
          const key = normalize(name)
          if (key === creditKey) {
            credits.tracks.push(track.id)
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

async function indexGenres (credits, genres) {
  for (const credit of creditCategories) {
    credit.genres = []
    for (const trackid of credit.tracks) {
      const track = index[trackid]
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

async function indexAlbums (credits, albums) {
  for (const credit of creditCategories) {
    credit.albums = []
    for (const album of albums) {
      if (!album.creditCategories || album.creditCategories.indexOf(credit.id) === -1) {
        continue
      }
      credit.albums.push(album.id)
    }
  }
}
