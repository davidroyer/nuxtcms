/* eslint-disable no-console */
const path = require('path')
const mdFileParser = require('front-matter')
const { arrayFromObject, titleCaseText } = require('./utils')
class ContentCollection {
  constructor(config, name) {
    this.config = config
    this.name = name
  }

  get files() {
    return this.config.Content.find(this.name, {
      matching: '*.md'
    })
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

  generate() {
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

  /**
   * Generates API file for collection
   * @param {string} file
   */
  generateApiFile(file) {
    const fileData = this.generateData(file) // this is createContentObject
    return this.config.Api.write(`TEST/${this.name}/index.json`, fileData)
  }

  generateData(mdFile) {
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
}

module.exports = ContentCollection

// NOTE: MIGHT NOT NEED THIS BY USING GETTER
// getFiles() {
//   return this.config.Content.find(this.name, {
//     matching: '*.md'
//   })
// }
