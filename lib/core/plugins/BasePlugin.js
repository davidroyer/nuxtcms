/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const path = require('path')
const { removeExtension } = require('../utils')
class BaseGenerator {
  constructor(config) {
    this.config = config
  }

  getFileName(filepath) {
    return path.basename(filepath, path.extname(filepath))
  }

  /**
   *
   * @param {string} resource Data Or Content
   * @param {string} resourceType .yml or .md
   */
  getFiles(resource, resourceType) {
    return this.config[resource].find({
      matching: `*.${resourceType}`,
      ignoreCase: true
    })
  }

  deleteApiFile(filepath) {
    const fileKey = this.getFileName(filepath)
    this.config.Api.remove(`${fileKey}`)
    return this
  }

  getApiFile(contentType) {
    return this.config.Api.read(`${contentType}/index.json`, 'json')
  }

  writeApiFile(file, data) {
    console.log('🚀 ~ file: BasePlugin.js ~ line 36 ~ BaseGenerator ~ writeApiFile ~ file', file)
    const filePath = removeExtension(file.toLowerCase())
    console.log('🚀 ~ file: BasePlugin.js ~ line 37 ~ BaseGenerator ~ writeApiFile ~ filePath', filePath)
    this.config.Api.write(`${filePath}/index.json`, data)
    return this
  }
}
module.exports = BaseGenerator
