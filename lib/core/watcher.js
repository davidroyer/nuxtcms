// import sane from 'sane'
const sane = require('sane')
module.exports = {
  create(dirToWatch, options = {}) {
    return sane(dirToWatch, { glob: ['**/*.md'] })
  }
}
