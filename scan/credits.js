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
  indexCreditAlbums,
  indexCreditGenres,
  indexCreditTracks,
  creditCategories
}

function normalize (text) {
  return text.toLowerCase().replace(/[\W_]+/g, ' ').trim()
}

async function scanCredits (library) {
  const uniqueKeys = []
  library.credits = []
  library.creditCategories = []
  for (const track of library.tracks) {
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
}

async function processCredit (library, name, uniqueKeys) {
  const key = normalize(name)
  const existingIndex = uniqueKeys.indexOf(key)
  if (existingIndex === -1) {
    uniqueKeys.push(key)
    return {
      type: 'credit',
      id: `credit_${library.credits.length}`,
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

async function indexCreditTracks (media, creditCategories) {
  for (const credit of creditCategories) {
    credit.tracks = []
    const tracks = media.filter(track => track.creditCategories.indexOf(credit.id) > -1)
    for (const track of tracks) {
      credit.tracks.push(track.id)
    }
  }
}

async function indexCreditGenres (media, creditCategories, index) {
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

async function indexCreditAlbums (albums, creditCategories) {
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
