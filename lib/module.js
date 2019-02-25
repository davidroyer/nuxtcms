/* eslint-disable no-console */
const path = require('path')
const yaml = require('js-yaml')
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
  options.cmsDirectoryPath = `./${options.nuxtSrcDir}/${options.cmsDirectory}`
  options.contentDirectoryPath = `./${options.nuxtSrcDir}/${options.cmsDirectory}/${options.contentDirectory}`
  options.dataDirectoryPath = `./${options.nuxtSrcDir}/${options.cmsDirectory}/${options.dataDirectory}`
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
  const CMS = jetpack.cwd(options.cmsDirectoryPath)
  const Content = jetpack.cwd(options.contentDirectoryPath)
  const Data = jetpack.cwd(options.dataDirectoryPath)
  const Api = jetpack.cwd(options.apiDirectoryPath)

  /**
   * Sets which files are markdown files at the root of the content directory
   * Sets the collections based on the folders at the root the content directory
   */
  const rootMarkdownFiles = Content.find({ matching: './*.md' })
  const collectionDirectories = Content.find({ matching: ['*', '!_*'], files: false, directories: true })
  // eslint-disable-next-line no-unused-vars
  const dataFiles = Data.find({ matching: ['*.yml'] })

  /**
   * Creates watcher
   */
  const ContentWatcher = watcher.create(`${options.contentDirectoryPath}`, { glob: '**/*.md' })
  const DataWatcher = watcher.create(`${options.dataDirectoryPath}`, { glob: '**/*.yml' })

  const CONFIG = {
    ...options,
    CMS,
    Content,
    Data,
    Api,
    rootMarkdownFiles,
    collectionDirectories,
    // menus,
    markdownIt
  }

  addMarkdownPlugins(CONFIG)
  setupBeforeInit(CONFIG)
  // console.log('CONFIG: ', CONFIG)

  DataWatcher
    .on('ready', () => {
      handleData(CONFIG)
    })
    .on('change', (filepath, root, stat) => {
      handleData(CONFIG)
    })
    .on('delete', (filepath, root) => {
      handleData(CONFIG)
    })

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
    const mdFilesArray = CONFIG.Content.find(collectionName, {
      matching: './*.md'
    })

    // Add the data to the postsArray variable we setup initially
    mdFilesArray.forEach((mdFile) => {
      const contentData = createContentObject(CONFIG, mdFile)
      collectionObject[contentData.slug] = contentData
    })

    CONFIG.Api.write(`${CONFIG.contentDirectory}/${collectionName}/index.json`, collectionObject)
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
  return CONFIG.Content.find({ matching: '*', files: false, directories: true })
}

const getDataFiles = (CONFIG) => {
  return CONFIG.Data.find({ matching: '*.yml', ignoreCase: true })
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
  const { contentDirectory, Api } = CONFIG
  const collectionName = path.dirname(filepath)
  if (!Api.exists(`${contentDirectory}/${collectionName}`)) {
    Api.write(`${contentDirectory}/${collectionName}/index.json`, {})
  }

  const collectionObject = Api.read(`${contentDirectory}/${collectionName}/index.json`, 'json')
  const collectionItem = createContentObject(CONFIG, filepath)
  const itemSlug = collectionItem.slug

  collectionObject[itemSlug] = collectionItem

  Api.write(`${contentDirectory}/${collectionName}/index.json`, collectionObject)
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
    CONFIG.Api.remove(`${CONFIG.contentDirectory}/${filepath}`)
  } else {
    const collectionName = path.dirname(filepath)
    const collectionObject = CONFIG.Api.read(`${CONFIG.contentDirectory}/${collectionName}/index.json`, 'json')
    const itemSlug = getFileName(filepath)

    delete collectionObject[itemSlug]

    CONFIG.Api.write(`${CONFIG.contentDirectory}/${collectionName}/index.json`, collectionObject)
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

  CONFIG.Api.write(`${CONFIG.contentDirectory}/${collection}/tags/index.json`, tagsObject)
}

const handleData = (CONFIG, filepath) => {
  const files = getDataFiles(CONFIG)

  files.forEach((file) => {
    const fileSlug = getFileName(file)
    const fileData = yaml.safeLoad(CONFIG.Data.read(file)) || {}
    CONFIG.Api.write(`${CONFIG.dataDirectory}/${fileSlug}/index.json`, fileData)
  })
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
