// s
const path = require('path')
const yaml = require('js-yaml')
const { removeExtension } = require('./utils')

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

  handleUpdate(filepath) {
    // eslint-disable-next-line no-console
    console.log('TCL: handleUpdate -> filepath', filepath)
    this.generateApiFile(filepath).generateRoutesFile()
    // this.generateRoutesFile()
    return this
    // const contentType = this.getDirectoryName(filepath)
    // const newData = this.updateData(contentType, filepath)

    // this.writeApiFile(contentType, newData)
    // this.generateRoutesFile()
    // return this
  }

  generateDataApi() {
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
    const fileKey = this.getFileName(file)
    const data = yaml.safeLoad(this.config.Data.read(file)) || {}
    return this.writeApiFile(fileKey, data)
  }

  generateFileData() {

  }

  writeApiFile(fileName, data) {
    this.config.Api.write(`${fileName}/index.json`, data)
    return this
  }

  generateRoutesFile() {
    const routes = this.getFiles().map(file => removeExtension(file))
    this.config.Api.write(`routes/data.json`, routes)
    return this
  }

  runGenerators(filepath) {
    if (filepath) {
      // eslint-disable-next-line no-console
      console.log('TCL: runGenerators -> filepath', filepath)
    }
    this.generateDataApi().generateRoutesFile()
  }
};

module.exports = DataPlugin
