/* eslint-disable no-console */
const path = require('path')
const jetpack = require('fs-jetpack')
const defaults = require('./core/defaults')
const watcher = require('./core/watcher')
const markdownIt = require('./core/markdown-parser')
const DataPlugin = require('./core/plugins/DataPlugin')
const ContentPlugin = require('./core/plugins/ContentPlugin')
const resolve = path.resolve
const {
  generateRoutes
} = require('./helpers')

function nuxtModule(moduleOptions) {
  const options = {
    ...defaults,
    ...moduleOptions,
    ...this.options.nuxtcms
  }
  options.nuxtSrcDir = path.relative(this.options.rootDir, this.options.srcDir)

  /**
   * Sets additional properties to the
   * options object that are needed for this service
   */
  optionsSetupHelper(options)
  options.isDev = this.options.dev
  const optionsForPlugin = Object.assign({}, options)
  delete optionsForPlugin.markdownPlugins

  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'nuxtcms.js',
    options: optionsForPlugin
  })

  /**
   * Sets up content and api directories
   * for the `fs-jetpack` module to use for its CWD
   */
  cmsDirectoriesChecker(options, jetpack)
  const CMS = jetpack.cwd(options.cmsDirectoryPath)
  const Content = jetpack.cwd(options.contentDirectoryPath)
  const Data = jetpack.cwd(options.dataDirectoryPath)
  const Api = jetpack.cwd(options.apiDirectoryPath)
  const PagesDirectory = jetpack.cwd(`${this.options.srcDir}/pages`)

  /**
   * Sets which files are markdown files at the root of the content directory
   * Sets the collections based on the folders at the root the content directory
   */
  const rootMarkdownFiles = Content.find({
    matching: './*.md',
    ignoreCase: true
  })

  const CONFIG = {
    ...options,
    CMS,
    Content,
    Data,
    Api,
    rootMarkdownFiles,
    markdownIt

  }
  addMarkdownPlugins(CONFIG)
  setupBeforeInit(CONFIG)

  /**
   * ADD ALIASE for cmsApi path
   */
  this.extendBuild((config) => {
    config.resolve.alias['@cmsApi'] = path.join(this.options.srcDir, options.apiDirectory)
  })

  /********************************************************************************/

  /**
   * @description
   * Creates watcher and CMS plugins
   */
  const cmsData = new DataPlugin(CONFIG)
  const cmsContent = new ContentPlugin(CONFIG)

  const ContentWatcher = watcher.create(`${options.contentDirectoryPath}`, {
    glob: ['**/*.md', '**/*.yml', '**/*.yaml']
  })
  const DataWatcher = watcher.create(`${options.dataDirectoryPath}`, {
    glob: '**/*.yml'
  })

  /********************************************************************************/

  /**
   * NOTE: SET UP WATCHERS - (THIS IS SOME LOVELY CODE BEING SO CONSISE)
   */
  DataWatcher
    .on('ready', () => cmsData.runGenerators())
    .on('change', filepath => cmsData.handleUpdate(filepath))
    .on('delete', filepath => cmsData.handleRemoval(filepath))

  ContentWatcher
    .on('ready', () => cmsContent.runGenerators())
    .on('change', filepath => cmsContent.handleUpdate(filepath))
    .on('delete', filepath => cmsContent.handleRemoval(filepath))

  /********************************************************************************/

  /**
   * NUXT HOOKS
   */

  this.nuxt.hook('done', () => {
    ContentWatcher.close()
    DataWatcher.close()
    Api.remove()
  })

  this.nuxt.hook('generate:done', () => {
    ContentWatcher.close()
    DataWatcher.close()
    Api.remove()
  })

  this.nuxt.hook('generate:extendRoutes', (routes) => {
    const dynamicRoutes = PagesDirectory.find({
      matching: '**/*.vue',
      ignoreCase: true
    }).filter(route => route.includes('_'))

    const contentTypesArray = cmsContent.contentTypes
    // const contentTypesArray = cmsContent.contentTypes.filter(type => type !== 'pages')
    const dataCollections = cmsData.dataCollections
    const collectionRoutes = [...contentTypesArray, ...dataCollections]
    const blogRoute = options.blogRoute

    dynamicRoutes.forEach((route) => {
      const { dir } = path.parse(route)
      if (!dir) return

      const collection = {
        name: dir,
        route: dir
      }

      if (dir === blogRoute) {
        collection.name = 'blog'
        collection.route = blogRoute
      }
      if (!collectionRoutes.includes(collection.name)) return

      const collectionObject = Api.read(`${collection.name}/index.json`, 'json')
      for (const slug in collectionObject) {
        routes.push({ route: `/${collection.route}/${slug}` })
      }
    })
  })
}

/********************************************************************************/

/**
 *  Setup to run before starting watcher and transformers
 * @param {Object} options
 */
function setupBeforeInit(options) {
  jetpack.dir(options.apiDirectoryPath, {
    empty: true
  })
}

/**
 * Adds any markdown-it plugins from user's config options
 * @param {Object} CONFIG
 */
const addMarkdownPlugins = (CONFIG) => {
  for (const plugin of CONFIG.markdownPlugins) {
    CONFIG.markdownIt.use(plugin)
  }
}

const optionsSetupHelper = (options) => {
  options.cmsDirectoryPath = `./${options.nuxtSrcDir}/${options.cmsDirectory}`
  options.contentDirectoryPath = `./${options.nuxtSrcDir}/${options.cmsDirectory}/${options.contentDirectory}`
  options.dataDirectoryPath = `./${options.nuxtSrcDir}/${options.cmsDirectory}/${options.dataDirectory}`
  options.apiDirectoryPath = `./${options.nuxtSrcDir}/${options.apiDirectory}`
}

const cmsDirectoriesChecker = (options, jetpack) => {
  if (!jetpack.exists(options.cmsDirectoryPath)) {
    jetpack
      .dir(options.cmsDirectoryPath)
      .dir(options.contentDirectory)
      .dir('Blog')
      .cwd('../..')
      .dir(options.dataDirectory)
  }
}

module.exports = nuxtModule
module.exports.meta = require('../package.json')
module.exports.cmsRouteGenerator = generateRoutes
