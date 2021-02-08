/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const path = require('path')
const jetpack = require('fs-jetpack')
const defaults = require('./core/defaults')
const watcher = require('./core/watcher')
const markdownIt = require('./core/markdown-parser')
const CMSPlugin = require('./core/plugins/CMSPlugin')
const resolve = path.resolve

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
  const Api = jetpack.cwd(options.apiDirectoryPath)

  const CONFIG = {
    ...options,
    CMS,
    Api,
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

  const cmsPlugin = new CMSPlugin(CONFIG)

  /********************************************************************************/

  /**
   * NOTE: SET UP WATCHERS
   */

  if (this.options.dev) {
    const CMSWatcher = watcher.create(`${options.cmsDirectoryPath}`, {
      glob: ['**/*.md', '**/*.yml', '**/*.yaml', '**/*.json']
    })

    CMSWatcher
      .on('ready', () => cmsPlugin.runGenerators())
      .on('change', filepath => cmsPlugin.handleUpdate(filepath))
      .on('delete', filepath => cmsPlugin.handleRemoval(filepath))

    this.nuxt.hook('close:done', function (nuxt) {
      CMSWatcher.close()
      Api.remove()
    })
  }

  /********************************************************************************/

  /**
   * NUXT HOOKS
   */

  if (!this.options.dev) {
    this.nuxt.hook('build:before', () => {
      console.log('PRODUCTION -> CREATING CMS API ')
      cmsPlugin.runGenerators()
    })
    this.nuxt.hook('generate:done', () => Api.remove())
  }
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
  options.apiDirectoryPath = `./${options.nuxtSrcDir}/${options.apiDirectory}`
}

const cmsDirectoriesChecker = (options, jetpack) => {
  if (!jetpack.exists(options.cmsDirectoryPath)) {
    jetpack
      .dir(options.cmsDirectoryPath)
      .dir('Blog')
  }
}

module.exports = nuxtModule
module.exports.meta = require('../package.json')
