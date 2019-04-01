
import emoji from 'markdown-it-emoji'
const { resolve } = require('path')
const { cmsRouteGenerator } = require('../')
// eslint-disable-next-line no-console

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
    fallback: true
    // routes: () => {
    //   const blogRoutes = cmsRouteGenerator(
    //     'articles',
    //     require(`./_API/articles`)
    //   )
    //   const projectRoutes = cmsRouteGenerator(
    //     'projects',
    //     require(`./_API/projects`)
    //   )

    //   return [...blogRoutes, ...projectRoutes]
    // }
  },

  build: {
  }
}
