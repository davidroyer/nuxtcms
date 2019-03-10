/* eslint-disable no-console */
const path = require('path')
// const yaml = require('js-yaml')
const mdFileParser = require('front-matter')
const jetpack = require('fs-jetpack')
const defaults = require('./core/defaults')
const {
  arrayFromObject,
  removeExtension,
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
  // console.log('OPTIONS: ', this.options)

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
  const collectionDirectories = Content.find({
    matching: ['*', '!_*'],
    files: false,
    directories: true
  })

  const CONFIG = {
    ...options,
    CMS,
    Content,
    Data,
    Api,
    rootMarkdownFiles,
    collectionDirectories,
    markdownIt
  }

  addMarkdownPlugins(CONFIG)
  setupBeforeInit(CONFIG)

  /**
   * Creates watcher
   */
  const ContentWatcher = watcher.create(`${options.contentDirectoryPath}`, {
    glob: '**/*.md'
  })
  const DataWatcher = watcher.create(`${options.dataDirectoryPath}`, {
    glob: '**/*.yml'
  })
  const cmsData = new DataPlugin(CONFIG)
  const cmsContent = new ContentPlugin(CONFIG)

  DataWatcher
    .on('ready', () => {
      console.log('DataWatcher - READY: ')
      cmsData
        .handleData()
        .handleRoutes()
    })
    .on('change', (filepath, root, stat) => {
      console.log('DataWatcher - CHANGE: ', filepath)
      cmsData
        .handleData()
        .handleRoutes()
    })
    .on('delete', (filepath, root) => {
      console.log('DataWatcher - DELETE: ', filepath)
      cmsData
        .deleteApiFile(filepath)
        .handleRoutes()
    })

  ContentWatcher
    .on('ready', () => {
      cmsContent
        .generateContentApi()
        .generateRoutesFile()

      console.log('data: ', cmsContent.data)

      // cmsContent.generateData()
      // console.log(cmsContent.getCollections())

      initialWrite(CONFIG)
    })
    .on('change', (filepath, root, stat) => {
      cmsContent
        .handleUpdate(filepath)
        .generateRoutesFile()

      handleItemUpdated(CONFIG, filepath)
    })
    .on('delete', (filepath, root) => {
      cmsContent
        .generateContentApi()
        .generateRoutesFile()

      // cmsContent
      //   .handleRemoval(filepath)
      //   .generateRoutesFile()

      handleItemRemoved(CONFIG, filepath)
    })

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

/**
 * Handles setting up the JSON files initially
 */
function initialWrite(CONFIG) {
  CONFIG.collectionDirectories.forEach((collectionName) => {
    const collectionObject = {}
    const files = CONFIG.Content.find(collectionName, {
      matching: './*.md'
    })
    // const collection = new Collection(CONFIG, collectionName)

    // Add the data to the postsArray variable we setup initially
    files.forEach((mdFile) => {
      const contentData = createContentObject(CONFIG, mdFile)
      collectionObject[contentData.slug] = contentData
    })

    CONFIG.Api.write(`${collectionName}/index.json`, collectionObject)
    handleTags(CONFIG, collectionName, collectionObject)
  })
  handleApiRoutes(CONFIG)
}

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

const getCollectionDirectories = (CONFIG) => {
  return CONFIG.Content.find({
    matching: '*',
    files: false,
    directories: true
  })
}

const getDataFiles = (CONFIG) => {
  return CONFIG.Data.find({
    matching: '*.yml',
    ignoreCase: true
  })
}

const saveApiRoutes = (CONFIG, apiRoutes) => {
  return CONFIG.Api.write(`routes/index.json`, apiRoutes)
}

const handleApiRoutes = (CONFIG) => {
  const apiRoutes = {
    content: [],
    data: []
  }

  apiRoutes.content = getCollectionDirectories(CONFIG)
  apiRoutes.data = getDataFiles(CONFIG).map(file => removeExtension(file))
  saveApiRoutes(CONFIG, apiRoutes)
}

/**
 * Responsible for updating JSON files when a content file has been be added or updated
 *
 * @param {object} CONFIG
 * @param {string} filepath
 */
const handleItemUpdated = (CONFIG, filepath) => {
  const { Api } = CONFIG
  const collectionName = path.dirname(filepath)
  if (!Api.exists(`${collectionName}`)) {
    Api.write(`${collectionName}/index.json`, {})
  }

  const collectionObject = Api.read(`${collectionName}/index.json`, 'json')
  const collectionItem = createContentObject(CONFIG, filepath)
  const itemSlug = collectionItem.slug

  collectionObject[itemSlug] = collectionItem

  Api.write(`${collectionName}/index.json`, collectionObject)
  handleTags(CONFIG, collectionName, collectionObject)
  handleApiRoutes(CONFIG)
}

/**
 * Responsible for updating JSON files when a content file has been removed
 *
 * @param {object} CONFIG
 * @param {string} filepath
 */
const handleItemRemoved = (CONFIG, filepath) => {
  const directoryWasRemoved = !filepath.includes('.')

  if (directoryWasRemoved) {
    // Directory has been deleted
    handleApiRoutes(CONFIG)
    CONFIG.Api.remove(`${filepath}`)
  } else {
    const collectionName = path.dirname(filepath)
    const collectionObject = CONFIG.Api.read(`${collectionName}/index.json`, 'json')
    const itemSlug = getFileName(filepath)

    delete collectionObject[itemSlug]

    CONFIG.Api.write(`${collectionName}/index.json`, collectionObject)
    handleTags(CONFIG, collectionName, collectionObject)
    handleApiRoutes(CONFIG)
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
