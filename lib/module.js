/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
// /* eslint-disable require-await */
import path, { resolve } from 'path'
import mdFileParser from 'front-matter'
import jetpack from 'fs-jetpack'
import defaults from './core/defaults'
import {
  arrayFromObject,
  createTagsList,
  removeExtension,
  slugify,
  titleCaseText
} from './core/utils'
import watcher from './core/watcher'
import markdownIt from './core/md'

function nuxtModule(moduleOptions) {
  const options = Object.assign({}, defaults, this.options.nuxtcms, moduleOptions)

  /**
   * Sets paths for use by module
   */
  options.contentDirectoryPath = `${this.nuxt.options.srcDir}/${options.contentDirectory}`
  options.apiDirectoryPath = `${this.nuxt.options.srcDir}/${options.apiDirectory}`

  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'nuxtcms.js',
    options
  })

  /**
   * Creates watcher
   */
  const ContentWatcher = watcher.create(options.contentDirectoryPath)

  /**
   * Sets up content and api directories for `fs-jetpack` to use for its CWD
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

  const CONFIG = {
    ...options,
    Content,
    Api,
    rootMarkdownFiles,
    collectionDirectories
  }

  setupBeforeInit(CONFIG)

  ContentWatcher
    .on('ready', () => {
      initialWrite(CONFIG)
    })
    .on('change', (filepath, root, stat) => {
      const collectionName = path.dirname(filepath)
      const filename = path.basename(filepath, path.extname(filepath))
      const jsonState = CONFIG.Api.read(`${collectionName}/index.json`, 'json')
      const newPostObject = createContentObject(CONFIG, filepath)

      jsonState[newPostObject.slug] = newPostObject
      CONFIG.Api.write(`${collectionName}/index.json`, jsonState)

      /**
       * @todo
       * * handleTags() goes here
       */
    })

  this.nuxt.hook('build:before', ({ name, compiler }) => {
    console.log('Before build hook')

    // * NOTE: ContentWatcher should possibly go here
  })

  this.nuxt.hook('done', nuxt => ContentWatcher.close())

  this.nuxt.hook('generate:before', async (generator) => {
    // This will be called before Nuxt generates your pages
  })
}

/**
 * Handles setting up the json files initially
 */
function initialWrite(CONFIG) {
  CONFIG.collectionDirectories.forEach((collection) => {
    const collectionObject = {}
    const mdFilesArray = CONFIG.Content.find(collection, {
      matching: './*.md'
    })

    // Add the data to the postsArray variable we setup initially
    mdFilesArray.forEach((mdFile) => {
      const contentData = createContentObject(CONFIG, mdFile)
      collectionObject[contentData.slug] = contentData
    })
    CONFIG.Api.write(`${collection}/index.json`, collectionObject)

    /**
     * Create tags and posts JSON files
     */
    handleTags(CONFIG, collection, collectionObject)
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
  // If slug is not set, automatically generate it from the filename by removing the extension
  const slug = mdFileData.attributes.slug
    ? mdFileData.attributes.slug
    : fileName

  // If title is not set, automatically generate it from the slug
  const title = mdFileData.attributes.title
    ? mdFileData.attributes.title
    : titleCaseText(slug)

  const tags = mdFileData.attributes.tags ? mdFileData.attributes.tags : []
  console.log('HTML: ', markdownIt.render(mdFileData.body))

  return {
    title,
    slug,
    tags,
    html: markdownIt.render(mdFileData.body),
    ...mdFileData.attributes
  }
}

const getDirectoryName = filepath => path.dirname(filepath)

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
  jetpack.dir(options.apiDirectory, {
    empty: true
  })
}

module.exports = nuxtModule
module.exports.meta = require('../package.json')
