/* eslint-disable no-console */
const path = require('path')
const { arrayFromObject } = require('./utils')
class ContentCollection {
  constructor(config, collectionName) {
    this.config = config
    this.collectionName = collectionName
    this.files = this.getFiles()
    this.data = {}
  }

  get collectionArray() {
    return this.arrayFromObject(this.data)
  }

  get slimmedCollectionArray() {
    const filesArray = arrayFromObject(this.files)
    return filesArray.map((item) => {
      delete item.html
      return item
    })
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
    this.this.config.Api.remove(`${fileSlug}`)
    return this
  }

  handleCollection() {
    console.log('FROM NEW COLLECTION CLASS - files:', this.files)

    this.files.forEach((file) => {
      try {
        console.log('FROM NEW COLLECTION CLASS - FILE: ', file)
        this.generateApiFile(file)
      } catch (e) {}
    })

    // this.handleTags()
    return this
  }

  handleUpdate(file) {
    // Check if is new item and if NOT, add it to this.files
    // Read content data from file param that is passed
    // Save data to JSON API file

    // handle tags
    // handle routes file
  }

  updateApiFile(filepath) {
    const fileSlug = this.getFileName(filepath)
    this.this.config.Api.remove(`${fileSlug}`)
    return this
  }

  getFiles() {
    return this.config.Content.find(this.collectionName, {
      matching: '*.md'
    })
  }

  /**
   * Generates API file for collection
   * @param {string} file
   */
  generateApiFile(file) {
    const fileData = this.generateData(file) // this is createContentObject
    return this.config.Api.write(`${this.collectionName}/index.json`, fileData)
  }

  generateData() {
    // this is createContentObject
  }

  get(path) {}
}

module.exports = ContentCollection
