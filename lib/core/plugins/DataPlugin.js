/* eslint-disable no-console */
// s
const path = require('path')
// eslint-disable-next-line no-unused-vars
const jsonMerge = require('json-merger')
const yaml = require('js-yaml')
const { removeExtension, uniqueArray } = require('../utils')

class DataPlugin {
  constructor(config) {
    this.config = config
    this.files = []
    this.setFiles()
  }

  isDataDirectory(filePath) {
    return path.dirname(filePath) !== '.'
  }

  getDirectoryName(filepath) {
    const {
      dir
    } = path.parse(filepath)
    return dir.replace('/', '')
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

  getDirectoryFiles(directoryName) {
    const files = this.config.Data.find(directoryName, {
      matching: '*.yml',
      ignoreCase: true
    })
    return files
  }

  getApiFile(path) {
    return this.config.Api.read(`${path}/index.json`, 'json')
  }

  get dataDirectories() {
    const dataDirectories = this.config.Data.find({
      matching: ['*', '!_*'],
      files: false,
      directories: true,
      ignoreCase: true
    })
    return dataDirectories.map(type => type.toLowerCase())
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

  handleDataDirectory(directory) {
    const directoryFiles = this.getDirectoryFiles(directory)
    const allDirectoryData = {}

    directoryFiles.forEach((file) => {
      const data = yaml.safeLoad(this.config.Data.read(file)) || {}
      const fileKey = this.getFileName(file)
      allDirectoryData[fileKey] = data
    })
    this.writeApiFile(directory, allDirectoryData)
  }

  handleRemoval(filepath) {
    if (this.isDataDirectory(filepath)) {
      const directory = this.getDirectoryName(filepath)
      this.handleDataDirectory(directory)
    } else {
      this.deleteApiFile(filepath)
    }
    this.generateRoutesFile()
    return this
  }

  handleUpdate(filepath) {
    if (this.isDataDirectory(filepath)) {
      const directory = this.getDirectoryName(filepath)
      this.handleDataDirectory(directory)
    } else {
      this.generateApiFile(filepath)
    }
    return this
  }

  generateDataApi() {
    this.setFiles()

    this.files.forEach((file) => {
      const isFile = !this.isDataDirectory(file)
      if (isFile) this.generateApiFile(file)
    })

    if (this.dataDirectories) {
      this.dataDirectories.forEach((directory) => {
        this.handleDataDirectory(directory)
      })
    }
    return this
  }

  /**
   *
   * @param {string} file The name of file
   */
  generateApiFile(file) {
    const data = yaml.safeLoad(this.config.Data.read(file)) || {}
    this.writeApiFile(file, data)
    return data
  }

  generateFileData() {}

  writeApiFile(file, data) {
    const filePath = removeExtension(file.toLowerCase())
    this.config.Api.write(`${filePath}/index.json`, data)

    return this
  }

  generateRoutesFile() {
    const routes = this.buildDataRoutes()
    this.config.Api.write(`routes/data.json`, routes)
    return this
  }

  buildDataRoutes() {
    const dataRoutes = this.getFiles().map((file) => {
      let fileRoute
      const { dir } = path.parse(file)

      if (dir) fileRoute = dir.toLowerCase().replace('/', '')
      else fileRoute = removeExtension(file)
      return fileRoute
    })
    return uniqueArray(dataRoutes)
  }

  runGenerators(filepath) {
    this.generateDataApi().generateRoutesFile()
  }
};

module.exports = DataPlugin
