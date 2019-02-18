import sane from 'sane'

export default {
  create(dirToWatch, options = {}) {
    return sane(dirToWatch, { glob: ['**/*.md'] })
  }
}
