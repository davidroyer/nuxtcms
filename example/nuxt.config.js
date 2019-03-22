
import emoji from 'markdown-it-emoji'
const { resolve } = require('path')
const { cmsRouteGenerator } = require('../')
// eslint-disable-next-line no-console

module.exports = {
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
        require(`./static/api/articles`)
      )
      const projectRoutes = cmsRouteGenerator(
        'projects',
        require(`./static/api/projects`)
      )

      return [...blogRoutes, ...projectRoutes]
    }
  },

  build: {
  }
}
