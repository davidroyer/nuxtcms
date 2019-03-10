import {
  removeExtension
} from './utils'
const path = require('path')
const yaml = require('js-yaml')

class DataPlugin {
  constructor(config) {
    this.config = config
    this.files = []
    this.setFiles()
  }

  getFileName(filepath) {
    return path.basename(filepath, path.extname(filepath))
  }

  getFiles() {
    return this.config.Data.find({
      matching: '*.yml',
      ignoreCase: true
    })
  }

  setFiles() {
    this.files = this.getFiles()
    return this
  }

  deleteApiFile(filepath) {
    const fileSlug = this.getFileName(filepath)
    this.config.Api.remove(`${fileSlug}`)
    return this
  }

  handleUpdate(file) {
    // Check if is new item and if NOT, add it to this.files
    // Read content data from file param that is passed
    // Save data to JSON API file
  }

  handleData() {
    this.setFiles()

    this.files.forEach((file) => {
      try {
        this.generateApiFile(file)
      } catch (e) {}
    })
    return this
  }

  /**
   *
   * @param {string} file The name of file
   */
  generateApiFile(file) {
    const fileSlug = this.getFileName(file)
    const fileData = yaml.safeLoad(this.config.Data.read(file)) || {}
    return this.config.Api.write(`${fileSlug}/index.json`, fileData)
  }

  /**
   *  An Array made of `strings` that are the routes made of the data files
   * @param {Array} dataRoutes
   */
  // saveRoutesFile(dataRoutes) {
  //   return this.config.Api.write(`routes/data.json`, dataRoutes)
  // }

  handleRoutes() {
    const routes = this.getFiles().map(file => removeExtension(file))
    this.config.Api.write(`routes/data.json`, routes)
    return this
  }
};

module.exports = DataPlugin
