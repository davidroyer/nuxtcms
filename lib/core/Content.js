/* eslint-disable no-console */
const path = require('path')
const mdFileParser = require('front-matter')
const { arrayFromObject, titleCaseText } = require('./utils')

class ContentPlugin {
  constructor(config) {
    this.config = config
    this.collections = []
    this.data = {}
  }

  get types() {
    return this.config.Content.find({
      matching: ['*', '!_*'],
      files: false,
      directories: true
    })
  }

  get collectionArray() {
    return arrayFromObject(this.data)
  }

  get slimmedCollectionArray() {
    const filesArray = arrayFromObject(this.files)
    return filesArray.map((item) => {
      delete item.html
      return item
    })
  }

  getCollections() {
    return this.collections
  }

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

  generateContentApi() {
    this.types.forEach((type) => {
      this.generateApiFile(type)
    })
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

  handleUpdate(filepath) {
    const contentType = this.getDirectoryName(filepath)
    const newData = this.updateData(contentType, filepath)
    this.writeApiFile(contentType, newData)
    return this
  }

  updateData(contentType, filepath) {
    const dataApi = this.getApiFile(contentType)
    const updatedFileData = this.getFileData(filepath)
    dataApi[updatedFileData.slug] = updatedFileData
    return dataApi
  }

  getApiFile(contentType) {
    return this.config.Api.read(`TEST/${contentType}/index.json`, 'json')
  }

  writeApiFile(contentType, data) {
    this.config.Api.write(`TEST/${contentType}/index.json`, data)
    return this
  }

  getFiles(type) {
    return this.config.Content.find(type, {
      matching: '*.md'
    })
  }

  getFileName(filepath) {
    return path.basename(filepath, path.extname(filepath))
  }

  getDirectoryName(filepath) {
    const { dir } = path.parse(filepath)
    return dir.replace('/', '')
  }
}

module.exports = ContentPlugin
