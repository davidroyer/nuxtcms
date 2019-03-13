
import emoji from 'markdown-it-emoji'
const { resolve } = require('path')
const { cmsRoutesGenerator } = require('../')
// eslint-disable-next-line no-console
console.log('cmsRoutesGenerator: ', cmsRoutesGenerator)

module.exports = {
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
    markdownPlugins: [
      emoji
    ]
  },

  generate: {
    fallback: true,
    routes: () => {
      const blogRoutes = cmsRoutesGenerator(
        'articles',
        require(`./static/api/articles`)
      )
      const projectRoutes = cmsRoutesGenerator(
        'projects',
        require(`./static/api/projects`)
      )

      return [...blogRoutes, ...projectRoutes]
    }
  },

  build: {
    // analyze: true
    // or
    // analyze: {
    //   analyzerMode: 'static'
    // }
  }
}
