/* eslint-disable no-console */
const path = require('path')
const mdFileParser = require('front-matter')
const {
  arrayFromObject,
  titleCaseText
} = require('../utils')

class ContentPlugin {
  constructor(config) {
    this.config = config
    this.data = {}
  }

  get contentTypes() {
    return this.config.Content.find({
      matching: ['*', '!_*'],
      files: false,
      directories: true
    })
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

  getFileName(filepath) {
    return path.basename(filepath, path.extname(filepath))
  }

  getFiles(type) {
    return this.config.Content.find(type, {
      matching: '*.md'
    })
  }

  getApiFile(contentType) {
    return this.config.Api.read(`${contentType}/index.json`, 'json')
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

  // NOTE: THE GENERATORS/FILE CREATORS

  generateContentApi() {
    this.contentTypes.forEach((type) => {
      this.generateApiFile(type)
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

  // NOTE: THE HANDLERS
  handleUpdate(filepath) {
    const contentType = this.getDirectoryName(filepath)
    const newData = this.updateData(contentType, filepath)

    this.writeApiFile(contentType, newData)
    this.generateRoutesFile()
    return this
  }

  handleRemoval(filepath) {
    const isDirectory = !filepath.includes('.')
    if (isDirectory) this.deleteApiFile(filepath).generateRoutesFile()
    else this.generateContentApi().generateRoutesFile()

    return this
  }

  updateData(contentType, filepath) {
    if (!this.directoryExist(filepath)) this.writeApiFile(contentType, {})
    const dataApi = this.getApiFile(contentType)
    const updatedFileData = this.getFileData(filepath)
    dataApi[updatedFileData.slug] = updatedFileData
    return dataApi
  }

  writeApiFile(contentType, data) {
    this.config.Api.write(`${contentType}/index.json`, data)
    return this
  }

  deleteApiFile(filepath) {
    const fileKey = this.getFileName(filepath)
    this.config.Api.remove(`${fileKey}`)
    return this
  }

  runGenerators() {
    this.generateContentApi().generateRoutesFile()
  }
}

module.exports = ContentPlugin
