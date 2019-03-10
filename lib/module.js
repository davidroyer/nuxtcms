/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const path = require('path')
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
const markdownIt = require('./core/md')
const DataPlugin = require('./core/DataPlugin')
// const Collection = require('./core/Collection')
const ContentPlugin = require('./core/ContentPlugin')
const resolve = path.resolve

function nuxtModule(moduleOptions) {
  const options = Object.assign({}, defaults, this.options.nuxtcms, moduleOptions)

  /**
   * Sets additional properties to the
   * options object that are needed for this service
   */
  options.nuxtSrcDir = path.relative(this.options.rootDir, this.options.srcDir)
  options.cmsDirectoryPath = `./${options.nuxtSrcDir}/${options.cmsDirectory}`
  options.contentDirectoryPath = `./${options.nuxtSrcDir}/${options.cmsDirectory}/${options.contentDirectory}`
  options.dataDirectoryPath = `./${options.nuxtSrcDir}/${options.cmsDirectory}/${options.dataDirectory}`
  options.apiDirectoryPath = `./${options.nuxtSrcDir}/${options.apiDirectory}`

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
    .on('ready', () => cmsData.handleData().handleRoutes())
    .on('change', filepath => cmsData.handleData().handleRoutes())
    .on('delete', filepath => cmsData.deleteApiFile(filepath).handleRoutes())

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

function createContentObject(CONFIG, mdFile) {
  const fileName = getFileName(mdFile)
  const mdFileData = mdFileParser(CONFIG.Content.read(mdFile))

  /**
   * If slug is not set,
   * automatically generate it from
   * the filename by removing the extension
   */
  const slug = mdFileData.attributes.slug
    ? mdFileData.attributes.slug
    : fileName

  /**
   * If title is not set,
   * automatically generate it from the slug
   */
  const title = mdFileData.attributes.title
    ? mdFileData.attributes.title
    : titleCaseText(slug)

  const html = markdownIt.render(mdFileData.body)

  const tags = mdFileData.attributes.tags ? mdFileData.attributes.tags : []

  /**
   * Returns object of for collection item
   */
  return {
    title,
    slug,
    tags,
    html,
    ...mdFileData.attributes
  }
}

// const getDirectoryName = filepath => path.dirname(filepath)
const getFileName = filepath => path.basename(filepath, path.extname(filepath))

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

module.exports = nuxtModule
module.exports.meta = require('../package.json')
