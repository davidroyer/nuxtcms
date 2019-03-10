/* eslint-disable no-console */
const path = require('path')
const Collection = require('./Collection')
const { arrayFromObject, titleCaseText } = require('./utils')
class ContentCollections {
  constructor(config) {
    this.config = config
    this.collections = []
    this.data = {}
  }

  get collectionTypes() {
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

  getCollectionsArray() {
    return this.collections
  }

  generateData() {
    this.collectionTypes.forEach((collectionName) => {
      const collection = new Collection(this.config, collectionName)
      this.collections.push(collection)

      collection.files.forEach((mdFile) => {
        const contentData = collection.generateData(mdFile)
        this.data[contentData.slug] = contentData
      })

      this.config.Api.write(`CONTENT/${collectionName}/index.json`, this.data)
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
