
import emoji from 'markdown-it-emoji'
import { generateRoutes } from '../lib/helpers'
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
  ],
  nuxtcms: {
    markdownPlugins: [
      emoji
    ]
  },

  generate: {
    fallback: true,
    routes: () => {
      const blogRoutes = generateRoutes(
        'articles',
        require(`./_CMS/api/articles`)
      )
      const projectRoutes = generateRoutes(
        'projects',
        require(`./_CMS/api/projects`)
      )

      return [...blogRoutes, ...projectRoutes]
    }
  }
}
