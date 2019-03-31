/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const path = require('path')
const http = require('http')
const fs = require('fs')
const socketIO = require('socket.io')
const mdFileParser = require('front-matter')
const jetpack = require('fs-jetpack')
const defaults = require('./core/defaults')
const {
  arrayFromObject,
  createTagsList,
  slugify,
  titleCaseText
} = require('./core/utils')
const watcher = require('./core/watcher')
const markdownIt = require('./core/markdown-parser')
const DataPlugin = require('./core/plugins/DataPlugin')
const ContentPlugin = require('./core/plugins/ContentPlugin')
const resolve = path.resolve
const {
  generateRoutes
} = require('./helpers')

function nuxtModule(moduleOptions) {
  const options = Object.assign({}, defaults, this.options.nuxtcms, moduleOptions)
  options.nuxtSrcDir = path.relative(this.options.rootDir, this.options.srcDir)

  /**
   * Sets additional properties to the
   * options object that are needed for this service
   */
  optionsSetupHelper(options)
  const optionsForPlugin = Object.assign({}, options)
  delete optionsForPlugin.markdownPlugins

  // this.addPlugin({
  //   src: resolve(__dirname, 'plugin.js'),
  //   fileName: 'nuxtcms.js',
  //   options: optionsForPlugin
  // })

  this.addPlugin({
    src: resolve(__dirname, 'v-store.js'),
    fileName: 'v-store.js',
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

  /**
   * Sets which files are markdown files at the root of the content directory
   * Sets the collections based on the folders at the root the content directory
   */
  const rootMarkdownFiles = Content.find({
    matching: './*.md'
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

  /********************************************************************************/

  /**
   * @description
   * Creates watcher and CMS plugins
   */
  const cmsData = new DataPlugin(CONFIG)
  const cmsContent = new ContentPlugin(CONFIG)

  const ContentWatcher = watcher.create(`${options.contentDirectoryPath}`, {
    glob: '**/*.md'
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
    .on('delete', filepath => cmsData.deleteApiFile(filepath).generateRoutesFile())
  // .on('delete', filepath => cmsContent.handleRemoval(filepath))

  ContentWatcher
    .on('ready', () => cmsContent.runGenerators())
    .on('change', filepath => cmsContent.handleUpdate(filepath))
    .on('delete', filepath => cmsContent.handleRemoval(filepath))

  /********************************************************************************/

  /**
   * NOTE: NUXT HOOKS
   */
  this.nuxt.hook('done', (nuxt) => {
    ContentWatcher.close()
    DataWatcher.close()
  })
  // this.nuxt.hook('done', nuxt => ContentWatcher.close())
  this.nuxt.hook('generate:done', (nuxt, errors) => {
    ContentWatcher.close()
    DataWatcher.close()
  })

  /********************************************************************************/

  /**
   * NOTE: SET UP SOCKETS
   */
  if (!this.options.dev) return
  if (this.options.dev) {
    console.log('From io/index.js - In DEV mode')
    const server = http.createServer(this.nuxt.renderer.app)
    const io = socketIO(server)

    // overwrite nuxt.server.listen()
    this.nuxt.server.listen = (port, host) =>
      new Promise(resolve =>
        server.listen(port || 3000, host || 'localhost', resolve)
      )

    // close this server on 'close' event
    this.nuxt.hook('close', () => new Promise(server.close))

    io.on('connection', (socket) => {
      socket.on('get-content', (fn) => {
        console.log('TCL: get-content')
        const contentTypes = cmsContent.contentTypes
        const content = {}
        contentTypes.forEach((type) => {
          const data = cmsContent.getCollectionArray(type)
          content[type] = data
        })
        // console.log('from server io - content', content)

        fn(content)
      })

      socket.on('get-posts', (fn) => {
        console.log('get-posts -- server side')
        const articlesArray = cmsContent.getCollectionArray('articles')
        fn(articlesArray)
      })
      socket.on('get-post', (slug, fn) => {
        console.log('get-post -- server side', slug)
        const articlesArray = cmsContent.getCollectionArray('articles')
        const article = articlesArray.find(post => post.slug === slug)
        fn(article)
      })

      fs.watch(`${CONFIG.apiDirectoryPath}`, {
        recursive: true
      }, (event, filename) => {
        const contentType = filename.split('/')[0]
        if (contentType === 'routes') return
        console.log('fs.watch: event, filename', event, filename)
        const data = cmsContent.getCollectionArray(contentType)
        // console.log('TCL: articlesArray amount', articlesArray.length)

        // GET DATA
        socket.emit('file-update', data, contentType)
      })
    })
  }
}

/********************************************************************************/

const createTagsObject = (postsArray) => {
  const tagsDataObject = {}
  const tagsList = createTagsList(postsArray)

  tagsList.forEach((tag) => {
    const tagObject = createTagObject(tag, postsArray)
    tagsDataObject[tagObject.slug] = tagObject
  })
  return tagsDataObject
}

const createTagObject = (tag, postsArray) => {
  const taggedPosts = postsArray.filter(post => post.tags.includes(tag))

  return {
    name: tag,
    posts: taggedPosts,
    slug: slugify(tag),
    title: titleCaseText(tag)
  }
}

/**
 * Create tags and posts JSON files
 */
const handleTags = (CONFIG, collection, collectionObject) => {
  const collectionArray = arrayFromObject(collectionObject)
  const slimmedCollectionArray = createSlimmedCollectionArray(collectionArray)
  const tagsObject = createTagsObject(slimmedCollectionArray)

  CONFIG.Api.write(`${collection}/tags/index.json`, tagsObject)
}

const createSlimmedCollectionArray = (collectionArray) => {
  return collectionArray.map((item) => {
    delete item.html
    return item
  })
}

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
  console.log('Running optionsSetupHelper...')

  options.cmsDirectoryPath = `./${options.nuxtSrcDir}/${options.cmsDirectory}`
  options.contentDirectoryPath = `./${options.nuxtSrcDir}/${options.cmsDirectory}/${options.contentDirectory}`
  options.dataDirectoryPath = `./${options.nuxtSrcDir}/${options.cmsDirectory}/${options.dataDirectory}`
  options.apiDirectoryPath = `./${options.nuxtSrcDir}/${options.apiDirectory}`
}

const cmsDirectoriesChecker = (options, jetpack) => {
  console.log('Running cmsDirectoriesChecker...')

  if (!jetpack.exists(options.cmsDirectoryPath)) {
    jetpack
      .dir(options.cmsDirectoryPath)
      .dir(options.contentDirectory)
      .cwd('..').dir(options.dataDirectory)
  }
}

module.exports = nuxtModule
module.exports.meta = require('../package.json')
module.exports.cmsRouteGenerator = generateRoutes
