import { removeExtension, toCamelCase } from './utils'
const path = require('path')
const yaml = require('js-yaml')

class DataPlugin {
  constructor(config) {
    this.config = config
    this._dataFiles = []
  }
  get dataFiles() {
    return this._dataFiles
  }

  set dataFiles(files) {
    this._dataFiles = files
  }

  get data() {
    return this.handleData()
  }

  getFileName(filepath) {
    return path.basename(filepath, path.extname(filepath))
  }

  getDataFiles() {
    return this.config.Data.find({ matching: '*.yml', ignoreCase: true })
  }

  deleteApiFile(filepath) {
    const fileSlug = this.getFileName(filepath)
    this.config.Api.remove(`${fileSlug}`)
    return this
  }

  handleData() {
    const files = this.getDataFiles(this.config)
    this._dataFiles = files
    files.forEach((file) => {
      try {
        this.generateApiFile(file)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }
    })
    this.createDataApiFile()
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
   *
   * @param {Array} dataRoutes An Array made of `strings` that are the routes made of the data files
   */
  saveRoutesFile(dataRoutes) {
    return this.config.Api.write(`routes/data.json`, dataRoutes)
  }

  handleRoutes() {
    const routes = this.getDataFiles().map(file => removeExtension(file))
    this.saveRoutesFile(routes)
    return this
  }

  generateKeyAndData(file) {
    const fileSlug = this.getFileName(file)
    const fileData = yaml.safeLoad(this.config.Data.read(file)) || {}
    return {
      key: toCamelCase(fileSlug),
      data: fileData
    }
  }

  createDataApiFile() {
    const data = this.generateDataCollection()
    return this.config.Api.write(`data/index.json`, data)
  }

  generateDataCollection() {
    const dataCollection = {}
    const files = this.getDataFiles(this.config)

    files.forEach((file) => {
      try {
        const fileObject = this.generateKeyAndData(file)
        dataCollection[fileObject.key] = fileObject.data
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }
    })

    return dataCollection
  }
};

module.exports = DataPlugin
