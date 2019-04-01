
import emoji from 'markdown-it-emoji'
const { resolve } = require('path')
const { cmsRouteGenerator } = require('../')
// eslint-disable-next-line no-console

module.exports = {
  head: {
    meta: [
      {
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, shrink-to-fit=no'
      }
    ]
  },
  env: {
    DEV_MODE: process.env.NODE_ENV !== 'production',
    WS_URL: process.env.WS_URL || 'http://localhost:3000'
  },
  css: ['@/assets/main.css'],
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
  router: {
    middleware: ['content']
  },
  // plugins: ['@/plugins/v-store.js'],
  generate: {
    fallback: true,
    routes: () => {
      const blogRoutes = cmsRouteGenerator(
        'articles',
        require(`./_api/articles`)
      )
      const projectRoutes = cmsRouteGenerator(
        'projects',
        require(`./_api/projects`)
      )

      return [...blogRoutes, ...projectRoutes]
    }
  },

  build: {
  }
}
