/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import path from 'path'
import mdFileParser from 'front-matter'
import jetpack from 'fs-jetpack'
import {
  arrayFromObject,
  createTagsList,
  removeExtension,
  slugify,
  titleCaseText
} from './core/utils'
import watcher from './core/watcher'
import md from './md'

const contentDirectory = `_content`
const apiDirectory = `_jsonApi`
const Content = jetpack.cwd(contentDirectory)
const Api = jetpack.cwd(apiDirectory)

const rootMarkdownFiles = Content.list().filter(item => /\.md$/g.test(item))
const collectionDirectories = Content.list().filter(
  item => !/\.md$/g.test(item)
)

const ContentWatcher = watcher.create(`./${contentDirectory}`)

const CONFIG = {
  contentDirectory,
  apiDirectory,
  Content,
  Api,
  ContentWatcher
}

setupBeforeInit(CONFIG)

ContentWatcher.on('ready', () => {
  console.log('Creating JSON Files from markdown files...')
  initialWrite()
  console.log('Done. Files Created!')
})

  /**
   * Handles content changing of existing files
   */
  .on('change', (filepath, root, stat) => {
    console.log(filepath)

    const collectionName = path.dirname(filepath)
    const filename = path.basename(filepath, path.extname(filepath))
    const jsonState = Api.read(`${collectionName}/index.json`, 'json')
    const newPostObject = createContentObject(filepath)

    jsonState[newPostObject.slug] = newPostObject
    Api.write(`${collectionName}/index.json`, jsonState)

    // const tagsObject = createTagsObject(arrayFromObject(jsonState))
    // Api.write(`tags/index.json`, tagsObject)
  })

  /**
   * Handles new files created
   */
  .on('add', (filepath, root, stat) => {
    const jsonState = Api.read(`${path.dirname(filepath)}/index.json`, 'json')
    const newPostObject = createContentObject(filepath)

    jsonState[newPostObject.slug] = newPostObject
    Api.write(`${path.dirname(filepath)}/index.json`, jsonState)

    // const tagsObject = createTagsObject(arrayFromObject(jsonState))
    // Api.write(`tags/index.json`, tagsObject)
  })

  /**
   * Handles files that are deleted
   */
  .on('delete', (filepath, root) => {
    const jsonState = Api.read(`${path.dirname(filepath)}/index.json`, 'json')
    const slugOfDeletedPost = removeExtension(filepath)

    delete jsonState[slugOfDeletedPost]
    Api.write(`${path.dirname(filepath)}/index.json`, jsonState)

    // const tagsObject = createTagsObject(arrayFromObject(jsonState))
    // Api.write(`tags/index.json`, tagsObject)
  })

/**
 * Handles setting up the json files initially
 */
function initialWrite() {
  collectionDirectories.forEach((collection) => {
    const collectionObject = {}
    const mdFilesArray = Content.find(collection, {
      matching: './*.md'
    })

    // Add the data to the postsArray variable we setup initially
    mdFilesArray.forEach((mdFile) => {
      const contentData = createContentObject(mdFile)
      collectionObject[contentData.slug] = contentData
    })
    Api.write(`${collection}/index.json`, collectionObject)

    /**
     * Create tags and posts JSON files
     */
    handleTags(collection, collectionObject)
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

const handleTags = (collection, collectionObject) => {
  const collectionArray = arrayFromObject(collectionObject)
  const slimmedCollectionArray = createSlimmedCollectionArray(collectionArray)
  const tagsObject = createTagsObject(slimmedCollectionArray)

  Api.write(`${collection}/tags/index.json`, tagsObject)
}

function createContentObject(mdFile) {
  const fileName = getFileName(mdFile)
  const mdFileData = mdFileParser(Content.read(mdFile))
  // If slug is not set, automatically generate it from the filename by removing the extension
  const slug = mdFileData.attributes.slug
    ? mdFileData.attributes.slug
    : fileName

  // If title is not set, automatically generate it from the slug
  const title = mdFileData.attributes.title
    ? mdFileData.attributes.title
    : titleCaseText(slug)

  const tags = mdFileData.attributes.tags ? mdFileData.attributes.tags : []

  return {
    title,
    slug,
    tags,
    html: md.render(mdFileData.body),
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

function setupBeforeInit(config) {
  jetpack.dir(config.apiDirectory, {
    empty: true
  })
}
/* --------------------------------------------------------------------- */

// const parsedPosts = posts.map(article => mdFileParser(article))

/* --------------------------------------------------------------------- */
