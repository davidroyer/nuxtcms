/* eslint-disable no-console */
const path = require('path')
const mdFileParser = require('front-matter')
const yamlFileParser = require('js-yaml')
// eslint-disable-next-line no-unused-vars
const {
  arrayFromObject,
  slugify,
  titleCaseText,
  uniqueArray,
  tagsTransformer
} = require('../utils')
const BaseGenerator = require('./BasePlugin')

const createTagsList = (postsArray) => {
  // const tagsArray = postsArray.map(post => {})
  const tagsArray = []
  // eslint-disable-next-line no-console
  console.log('postsArray: ', postsArray)

  postsArray.forEach((post) => {
    if (post.tags.length) {
      post.tags.forEach(tag => tagsArray.push(tag))
    }
  })
  return uniqueArray(tagsArray)
}
// function isEmptyObject(obj) {
//   for (const key in obj) {
//     if (obj.hasOwnProperty(key)) { return false }
//   }
//   return true
// }
class ContentPlugin extends BaseGenerator {
  constructor(config) {
    super(config)
    this.data = {}
  }

  get contentTypes() {
    const contentTypes = this.config.Content.find({
      matching: ['*', '!_*'],
      files: false,
      directories: true,
      ignoreCase: true
    })
    return contentTypes
    // return contentTypes.map(type => type.toLowerCase())
  }

  get slimmedCollectionArray() {
    const filesArray = arrayFromObject(this.files)
    return filesArray.map((item) => {
      delete item.html
      return item
    })
  }

  isYamlFile(file) {
    const {
      ext
    } = path.parse(file)
    if (ext === '.yml' || ext === '.yaml') return true
    else return false
  }
  directoryExist(collectionName) {
    return this.config.Api.exists(`${collectionName}`)
  }

  // NOTE: THE GET METHODS

  getCollectionArray(contentType) {
    const data = this.getApiFile(contentType.toLowerCase()) || []
    return arrayFromObject(data)
  }

  getDirectoryName(filepath) {
    const {
      dir
    } = path.parse(filepath)
    return dir.replace('/', '')
  }

  getFiles(type) {
    return this.config.Content.find(type, {
      matching: ['*.md', '*.yml', '*.yaml'],
      ignoreCase: true
    })
  }

  getYamlFileData(file) {
    const fileKey = this.getFileName(file)
    const yamlData = yamlFileParser.safeLoad(this.config.Content.read(file)) || {}
    return this.transformData(fileKey, yamlData)
  }

  getMdFileData(mdFile) {
    const fileName = this.getFileName(mdFile)
    const mdFileData = mdFileParser(this.config.Content.read(mdFile))

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

    const tagsData = tagsTransformer(tags)

    const html = this.config.markdownIt.render(mdFileData.body)

    /**
     * Returns object of for collection item
     */
    return {
      ...mdFileData.attributes,
      tagsData,
      title,
      slug,
      tags,
      html
    }
  }

  // NOTE: THE GENERATORS/FILE CREATORS

  generateContentApi() {
    // eslint-disable-next-line no-console
    console.log('this.contentTypes: ', this.contentTypes)

    this.contentTypes.forEach((type) => { this.generateApiFile(type) })
    return this
  }

  generateTagsApi() {
    this.contentTypes.forEach((type) => {
      this.generateTagsFile(type)
    })
    return this
  }
  /**
   * Generates API file for collection
   * @param {string} file
   */
  generateApiFile(type) {
    const apiData = {}
    const files = this.getFiles(type)
    const isProduction = !this.config.isDev

    files.forEach((file) => {
      let fileData
      if (this.isYamlFile(file)) {
        fileData = this.getYamlFileData(file)
      } else {
        fileData = this.getMdFileData(file)
      }

      if (isProduction && fileData.draft === true) return
      apiData[fileData.slug] = fileData
    })
    return this.writeApiFile(type, apiData)
  }

  generateRoutesFile() {
    const contentRoutes = this.contentTypes.map(type => type.toLowerCase())
    this.config.Api.write(`routes/content.json`, contentRoutes)
    return this
  }

  generateTagsFile(contentType) {
    const transformedCollectionArray =
      this.getCollectionArray(contentType)
        .filter(contentItem => contentItem.tags && contentItem.tags.length > 0)
        .map((contentItem) => {
          delete contentItem.html
          return contentItem
        })

    if (transformedCollectionArray.length > 0) {
      const tagsList = createTagsList(transformedCollectionArray)
      console.log('TCL: ContentPlugin -> generateTagsFile -> tagsList', tagsList)
      const tagsApiData = {}
      tagsList.map((tag) => {
        const postsForTag = transformedCollectionArray.filter(post => post.tags.includes(tag))
        const tagObject = {
          name: tag,
          slug: slugify(tag),
          title: titleCaseText(tag)
        }
        tagsApiData[tagObject.slug] = {
          ...tagObject,
          posts: [...postsForTag]
        }

        // return {
        //   ...tagData,
        //   posts: [...postsForTag]
        // }
      })

      this.config.Api.write(`${contentType.toLowerCase()}/tags/index.json`, tagsApiData)
    }
    // console.log('transformedCollectionArray: ', transformedCollectionArray)

    // console.log('TCL: ContentPlugin -> generateTagsFile -> tagsList', tagsList)

    // const tagsTest = createTagsObject(transformedCollectionArray)
    // console.log('TCL: ContentPlugin -> generateTagsFile -> tagsTest', tagsTest)

    return this
  }

  // NOTE: THE HANDLERS

  /**
   * Hanldes updates during DEV
   * @param {string} filepath
   */
  handleUpdate(filepath) {
    const contentType = this.getDirectoryName(filepath)
    const newData = this.updateData(contentType, filepath)

    this.writeApiFile(contentType, newData)
    this.generateRoutesFile().generateTagsApi()
    return this
  }

  handleRemoval(filepath) {
    const isDirectory = !filepath.includes('.')

    isDirectory
      ? this.deleteApiFile(filepath).generateRoutesFile().generateTagsApi()
      : this.generateContentApi().generateRoutesFile().generateTagsApi()

    return this
  }

  updateData(contentType, filepath) {
    const contentTypeExist = this.config.Api.exists(`${contentType}`)
    let updatedFileData

    if (!contentTypeExist) this.writeApiFile(contentType, {})

    if (this.isYamlFile(filepath)) {
      updatedFileData = this.getYamlFileData(filepath)
    } else {
      updatedFileData = this.getMdFileData(filepath)
    }

    const dataApi = this.getApiFile(contentType)
    dataApi[updatedFileData.slug] = updatedFileData
    return dataApi
  }

  runGenerators() {
    this.generateContentApi().generateRoutesFile()
    this.generateTagsApi()
  }

  transformData(fileKey, data) {
    const slug = data.slug ? data.slug : fileKey
    const title = data.title ? data.title : titleCaseText(slug)

    data.slug = slug
    data.title = title

    return data
  }
}

module.exports = ContentPlugin
