/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
const path = require('path')
const { removeExtension } = require('../utils')
class BaseGenerator {
  constructor(config) {
    this.config = config
  }

  getFileName(filepath) {
    console.log('TCL: BaseGenerator -> getFileName -> filepath', filepath)
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
    console.log('TCL: BaseGenerator -> deleteApiFile -> filepath', filepath)
    const fileKey = this.getFileName(filepath)
    this.config.Api.remove(`${fileKey}`)
    return this
  }

  getApiFile(contentType) {
    console.log('TCL: BaseGenerator -> getApiFile -> contentType', contentType)
    return this.config.Api.read(`${contentType}/index.json`, 'json')
  }

  writeApiFile(file, data) {
    console.log('TCL: BaseGenerator -> writeApiFile -> file', file)
    const filePath = removeExtension(file.toLowerCase())
    this.config.Api.write(`${filePath}/index.json`, data)
    return this
  }
}
module.exports = BaseGenerator
