
// import emoji from 'markdown-it-emoji'
const { resolve } = require('path')
// eslint-disable-next-line no-console

module.exports = {
  target: 'static',
  rootDir: resolve(__dirname, '..'),
  buildDIr: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  render: {
    resourceHints: false
  },
  modules: [
    { handler: require('../') }
  ],
  nuxtcms: {
    // blogRoute: 'articles'
  },

  generate: {
    fallback: true

  },

  build: {
  }
}
