/* eslint-disable no-console */
import path, {
  resolve
} from 'path'
import mdFileParser from 'front-matter'
import jetpack from 'fs-jetpack'
import defaults from './core/defaults'
import {
  arrayFromObject,
  createTagsList,
  slugify,
  titleCaseText
} from './core/utils'
import watcher from './core/watcher'
import markdownIt from './core/md'

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
  const ContentWatcher = watcher.create(`${options.nuxtSrcDir}/_content`)

  /**
   * NOTE: Possibly:
    const ContentWatcher = watcher.create(`./${options.nuxtSrcDir}/_content`)
   *
   */
  const CONFIG = {
    ...options,
    Content,
    Api,
    rootMarkdownFiles,
    collectionDirectories
  }

  console.log('CONFIG: ', CONFIG)

  setupBeforeInit(CONFIG)

  ContentWatcher
    .on('ready', () => {
      initialWrite(CONFIG)
    })
    .on('change', (filepath, root, stat) => {
      const collectionName = path.dirname(filepath)
      const collectionObject = CONFIG.Api.read(`${collectionName}/index.json`, 'json')
      const newPostObject = createContentObject(CONFIG, filepath)

      collectionObject[newPostObject.slug] = newPostObject

      CONFIG.Api.write(`${collectionName}/index.json`, collectionObject)
      console.log('collectionObject: ', collectionObject)

      /**
     * Create tags and posts JSON files
     */
      handleTags(CONFIG, collectionName, collectionObject)
    })

  this.nuxt.hook('build:before', ({
    name,
    compiler
  }) => {
    console.log('Before build hook')

    // * NOTE: ContentWatcher should possibly go here
  })

  this.nuxt.hook('done', nuxt => ContentWatcher.close())

  this.nuxt.hook('generate:before', async (generator) => {
    // This will be called before Nuxt generates your pages
  })
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

    /**
     * Create tags JSON file for the collection if they exist
     */
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
