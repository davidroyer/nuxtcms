// /* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const path = require('path')
const yaml = require('js-yaml')

class DataTranformer {
  constructor(config) {
    this.config = config
    this._dataFiles = []
    // this
    // this.dataFiles = getDataFiles
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

  getFiles() {
    return this._getFiles
  }

  getFileName(filepath) {
    return path.basename(filepath, path.extname(filepath))
  }

  getDataFiles() {
    return this.config.Data.find({ matching: '*.yml', ignoreCase: true })
  }

  deleteApiFile(filepath) {
    console.log('TCL: DataTranformer -> deleteApiFile -> filepath', filepath)
    const fileSlug = this.getFileName(filepath)
    return this.config.Api.remove(`${this.config.dataDirectory}/TEST/${fileSlug}`)
  }

  handleData() {
    const files = this.getDataFiles(this.config)
    this._dataFiles = files
    files.forEach((file) => {
      try {
        console.log('FILE FROM DATA-WATCHER CLASS: ', file)
        this.generateApiFile(file)
      } catch (e) {
        console.log(e)
      }
    })
    return this
    // return this.config.Api.write(`${this.config.dataDirectory}/TEST/${fileSlug}/index.json`, fileData)
  }
  generateApiFile(file) {
    const fileSlug = this.getFileName(file)
    console.log('generateApiFile - fileSlug: ', fileSlug)

    const fileData = yaml.safeLoad(this.config.Data.read(file)) || {}
    return this.config.Api.write(`${this.config.dataDirectory}/TEST/${fileSlug}/index.json`, fileData)
  }
};

module.exports = DataTranformer
