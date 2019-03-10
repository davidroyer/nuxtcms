/* eslint-disable no-console */
const path = require('path')
const mdFileParser = require('front-matter')
const Collection = require('./Collection')
const { arrayFromObject, titleCaseText } = require('./utils')

class ContentCollections {
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
  setupCollections() {

  }

  getCollections() {
    return this.collections
  }

  generateCollectionData(mdFile) {
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

  generateData() {
    this.types.forEach((collectionName) => {
      const collection = new Collection(this.config, collectionName)
      this.collections.push(collection)

      collection.files.forEach((mdFile) => {
        const contentData = collection.generateData(mdFile)
        this.data[contentData.slug] = contentData
      })

      this.config.Api.write(`CONTENT-NEW/${collectionName}/index.json`, this.data)
      // handleTags(this.config, collectionName, collectionObject)
    })
    console.log('TCL: generateData -> generateData - this.data', this.data)

    // handleApiRoutes(this.config)
  }

  updateApiFile(filepath) {
    const fileSlug = this.getFileName(filepath)
    this.config.Api.remove(`${fileSlug}`)
    return this
  }

  /**
   * Generates API file for collection
   * @param {string} file
   */
  generateApiFile(file) {
    const fileData = this.generateData(file) // this is createContentObject
    return this.config.Api.write(`TEST/${this.name}/index.json`, fileData)
  }

  generateCollection() {
    this.files.forEach((file) => {
      try {
        this.generateApiFile(file)
      } catch (e) {}
    })

    // this.handleTags()
    return this
  }

  getFileName(filepath) {
    return path.basename(filepath, path.extname(filepath))
  }

  getDirectoryName(filepath) {
    const { dir } = path.parse(filepath)
    return dir.replace('/', '')
  }

  deleteApiFile(filepath) {
    const fileSlug = this.getFileName(filepath)
    this.config.Api.remove(`${fileSlug}`)
    return this
  }
}

module.exports = ContentCollections
