/* eslint-disable no-console */
const path = require('path')
const mdFileParser = require('front-matter')
const {
  arrayFromObject,
  titleCaseText } = require('../utils')
const groupBy = require('../groupBy')
const BaseGenerator = require('./BasePlugin')
class ContentPlugin extends BaseGenerator {
  constructor(config) {
    super(config) // Would throw a TypeError.
    this.data = {}
  }

  get contentTypes() {
    const contentTypes = this.config.Content.find({
      matching: ['*', '!_*'],
      files: false,
      directories: true,
      ignoreCase: true
    })
    return contentTypes.map(type => type.toLowerCase())
  }

  get slimmedCollectionArray() {
    const filesArray = arrayFromObject(this.files)
    return filesArray.map((item) => {
      delete item.html
      return item
    })
  }

  directoryExist(collectionName) {
    return this.config.Api.exists(`${collectionName}`)
  }

  // NOTE: THE GET METHODS

  getCollectionArray(contentType) {
    const data = this.getApiFile(contentType)
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
      matching: '*.md',
      ignoreCase: true
    })
  }

  // getApiFile(contentType) {
  //   return this.config.Api.read(`${contentType}/index.json`, 'json')
  // }

  getFileData(mdFile) {
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

    const html = this.config.markdownIt.render(mdFileData.body)

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

  // NOTE: THE GENERATORS/FILE CREATORS

  generateContentApi() {
    this.contentTypes.forEach((type) => {
      this.generateApiFile(type)
    })
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
    const data = {}
    const files = this.getFiles(type)

    files.forEach((file) => {
      const fileData = this.getFileData(file)
      data[fileData.slug] = fileData
    })
    return this.writeApiFile(type, data)
  }

  generateRoutesFile() {
    this.config.Api.write(`routes/content.json`, this.contentTypes)
    return this
  }

  generateTagsFile(contentType) {
    const transformedCollectionArray =
      this.getCollectionArray(contentType)
        .filter(contentItem => contentItem.tags.length > 0)
        .map((contentItem) => {
          delete contentItem.html
          return contentItem
        })

    const tagsApiData = groupBy(transformedCollectionArray, ['tags'])

    this.config.Api.write(`${contentType.toLowerCase()}/tags/index.json`, tagsApiData)
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
    if (!contentTypeExist) {
      this.writeApiFile(contentType, {})
    }

    const dataApi = this.getApiFile(contentType)
    const updatedFileData = this.getFileData(filepath)
    dataApi[updatedFileData.slug] = updatedFileData
    return dataApi
  }

  runGenerators() {
    this.generateContentApi().generateRoutesFile()
    this.generateTagsApi()
  }
}

module.exports = ContentPlugin
