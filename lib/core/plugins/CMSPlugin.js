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
  const tagsArray = []
  postsArray.forEach((post) => {
    if (post.tags) {
      const postTagsArray = Object.keys(post.tags)
      postTagsArray.forEach(tag => tagsArray.push(tag))
    }
  })
  return uniqueArray(tagsArray)
}

class CMSPlugin extends BaseGenerator {
  constructor(config) {
    super(config)
    this.data = {}
    this.CMS = this.config.CMS
  }

  get contentTypes() {
    const contentTypes = this.CMS.find({
      matching: ['*', '!.cmsApi', '!_*'],
      files: false,
      directories: true,
      ignoreCase: true
    })
    console.log('🚀 ~ file: CmsPlugin.js ~ line 41 ~ CMSPlugin ~ getcontentTypes ~ contentTypes', contentTypes)
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

  getExtension(file) {
    const { ext } = path.parse(file)
    return ext
  }

  isYamlFile(file) {
    if (this.getExtension(file) === '.yml' || this.getExtension(file) === '.yaml') return true
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
    return this.CMS.find(type, {
      matching: ['*.md', '*.json', '*.yml', '*.yaml'],
      ignoreCase: true
    })
  }

  getJsonFileData(file) {
    const fileKey = this.getFileName(file)
    let jsonData

    try {
      jsonData = this.CMS.read(file, 'jsonWithDates')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(new Error(`Could't read the JSON file. Make sure it's properly formatted`))
      jsonData = {}
    }
    return this.transformData(fileKey, jsonData)
  }

  getMdFileData(mdFile) {
    const fileName = this.getFileName(mdFile)
    const mdFileData = mdFileParser(this.CMS.read(mdFile))

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

    const tags = mdFileData.attributes.tags ? tagsTransformer(mdFileData.attributes.tags) : {}

    const html = this.config.markdownIt.render(mdFileData.body)

    /**
     * Returns object of for collection item
     */
    return {
      ...mdFileData.attributes,
      // tagsData,
      title,
      slug,
      tags,
      html
    }
  }

  getYamlFileData(file) {
    const fileKey = this.getFileName(file)
    const yamlData = yamlFileParser.safeLoad(this.CMS.read(file)) || {}
    return this.transformData(fileKey, yamlData)
  }
  // NOTE: THE GENERATORS/FILE CREATORS

  generateContentApi() {
    this.contentTypes.forEach(type => this.generateApiFile(type))
    return this
  }

  generateTagsApi() {
    this.contentTypes.forEach(type => this.generateTagsFile(type))
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
      const fileType = this.getExtension(file)

      if (fileType === '.json') fileData = this.getJsonFileData(file)
      else if (this.isYamlFile(file)) fileData = this.getYamlFileData(file)
      else fileData = this.getMdFileData(file)

      if (isProduction && fileData.draft === true) return
      apiData[fileData.slug] = fileData
    })
    return this.writeApiFile(type, apiData)
  }

  generateRoutesFile() {
    const contentRoutes = this.contentTypes.map(type => type.toLowerCase())
    // eslint-disable-next-line no-console
    console.log('🚀 ~ file: CmsPlugin.js ~ line 181 ~ CMSPlugin ~ generateRoutesFile ~ contentRoutes', contentRoutes)
    this.config.Api.write(`routes/content.json`, contentRoutes)
    return this
  }

  generateTagsFile(contentType) {
    const transformedCollectionArray =
      this.getCollectionArray(contentType)
        .filter(contentItem => contentItem.tags)
        .map((contentItem) => {
          delete contentItem.html
          return contentItem
        })

    if (transformedCollectionArray.length > 0) {
      const tagsApiData = {}
      const tagsList = createTagsList(transformedCollectionArray)

      tagsList.map((tag) => {
        const postsForTag = transformedCollectionArray.filter(post => post.tags[tag])

        const tagObject = {
          name: tag,
          slug: slugify(tag),
          title: titleCaseText(tag)
        }

        tagsApiData[tagObject.slug] = {
          ...tagObject,
          posts: [...postsForTag]
        }
      })
      this.config.Api.write(`${contentType.toLowerCase()}/tags/index.json`, tagsApiData)
    }
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

  updateData(contentType, file) {
    const fileType = this.getExtension(file)
    const contentTypeExist = this.config.Api.exists(`${contentType}`)
    let updatedFileData

    if (!contentTypeExist) this.writeApiFile(contentType, {})

    if (fileType === '.json') updatedFileData = this.getJsonFileData(file)
    else if (this.isYamlFile(file)) updatedFileData = this.getYamlFileData(file)
    else updatedFileData = this.getMdFileData(file)

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

module.exports = CMSPlugin
