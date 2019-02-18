import emoji from 'markdown-it-emoji'
const { resolve } = require('path')

module.exports = {
  rootDir: resolve(__dirname, '..'),
  buildDIr: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  render: {
    resourceHints: false
  },
  modules: [
    { handler: require('../') }
  ]
  // nuxtcms: {
  //   markdownPlugins: [
  //     emoji
  //   ]
  // }
}
