/* eslint-disable no-console */
const path = require('path')
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
const resolve = path.resolve

function nuxtModule(moduleOptions) {
  const options = Object.assign({}, defaults, this.options.nuxtcms, moduleOptions)

  /**
   * Sets additional properties to the
   * options object that are needed for this service
   */
  options.nuxtSrcDir = path.relative(this.options.rootDir, this.options.srcDir)
  options.contentDirectoryPath = `./${options.nuxtSrcDir}/${options.contentDirectory}`
  options.apiDirectoryPath = `./${options.nuxtSrcDir}/${options.apiDirectory}`

  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'nuxtcms.js',
    options
  })

  /**
   * Sets up content and api directories
   * for the `fs-jetpack` module to use for its CWD
   */
  const Content = jetpack.cwd(options.contentDirectoryPath)
  const Api = jetpack.cwd(options.apiDirectoryPath)

  /**
   * Sets which files are markdown files at the root of the content directory
   * Sets the collections based on the folders at the root the content directory
   */
  const rootMarkdownFiles = Content.list().filter(item => /\.md$/g.test(item))
  const collectionDirectories = Content.list().filter(
    item => !/\.md$/g.test(item)
  )

  /**
   * TODO - Fix this
   * Adds any markdown-it plugins from user's config options
   */
  // for (const plugin of options.markdownPlugins) {
  //   markdownIt.use(plugin)
  // }
  // options.markdownPlugins.forEach(plugin => {
  //   markdownIt.use(plugin)
  // });

  /**
   * Creates watcher
   */
  const ContentWatcher = watcher.create(`${options.contentDirectoryPath}`)

  const CONFIG = {
    ...options,
    Content,
    Api,
    rootMarkdownFiles,
    collectionDirectories
  }

  setupBeforeInit(CONFIG)
  console.log('CONFIG: ', CONFIG)

  ContentWatcher
    .on('ready', () => {
      initialWrite(CONFIG)
    })
    .on('change', (filepath, root, stat) => {
      handleItemUpdated(CONFIG, filepath)
    })
    .on('delete', (filepath, root) => {
      handleItemRemoved(CONFIG, filepath)
    })

  this.nuxt.hook('build:before', ({ name, compiler }) => {})
  this.nuxt.hook('done', nuxt => ContentWatcher.close())
  this.nuxt.hook('generate:before', async (generator) => {})
}

/**
 * Handles setting up the JSON files initially
 */
function initialWrite(CONFIG) {
  CONFIG.collectionDirectories.forEach((collectionName) => {
    const collectionObject = {}
    const mdFilesArray = CONFIG.Content.find(collectionName, {
      matching: './*.md'
    })

    // Add the data to the postsArray variable we setup initially
    mdFilesArray.forEach((mdFile) => {
      const contentData = createContentObject(CONFIG, mdFile)
      collectionObject[contentData.slug] = contentData
    })

    CONFIG.Api.write(`${collectionName}/index.json`, collectionObject)
    handleTags(CONFIG, collectionName, collectionObject)
  })
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

/**
 * Responsible for updating JSON files when a content file has been be added or updated
 *
 * @param {object} CONFIG
 * @param {string} filepath
 */
const handleItemUpdated = (CONFIG, filepath) => {
  const collectionName = path.dirname(filepath)
  const collectionObject = CONFIG.Api.read(`${collectionName}/index.json`, 'json')
  const collectionItem = createContentObject(CONFIG, filepath)
  const itemSlug = collectionItem.slug

  collectionObject[itemSlug] = collectionItem

  CONFIG.Api.write(`${collectionName}/index.json`, collectionObject)
  handleTags(CONFIG, collectionName, collectionObject)
}

/**
 * Responsible for updating JSON files when a content file has been removed
 *
 * @param {object} CONFIG
 * @param {string} filepath
 */
const handleItemRemoved = (CONFIG, filepath) => {
  const collectionName = path.dirname(filepath)
  const collectionObject = CONFIG.Api.read(`${collectionName}/index.json`, 'json')
  const itemSlug = removeExtension(filepath)

  delete collectionObject[itemSlug]

  CONFIG.Api.write(`${collectionName}/index.json`, collectionObject)
  handleTags(collectionName, collectionObject)
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

  const tags = mdFileData.attributes.tags ? mdFileData.attributes.tags : []

  /**
     * Returns object of for collection item
   */
  return {
    title,
    slug,
    tags,
    html: markdownIt.render(mdFileData.body),
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

module.exports = nuxtModule
module.exports.meta = require('../package.json')
