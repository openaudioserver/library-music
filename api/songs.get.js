module.exports = (library, options) => {
  const song = library.getObject(options.id)
  if (!song) {
    throw new Error('invalid-id')
  }
  return song
}
