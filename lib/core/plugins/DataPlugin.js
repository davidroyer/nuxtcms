/* eslint-disable no-console */
// s
const path = require('path')
const yaml = require('js-yaml')
const { removeExtension, uniqueArray, titleCaseText } = require('../utils')
const BaseGenerator = require('./BasePlugin')

class DataPlugin extends BaseGenerator {
  constructor(config) {
    super(config)
    this.files = []
    this.setFiles()
  }

  isDataDirectory(filePath) {
    return path.dirname(filePath) !== '.'
  }

  getDirectoryName(filepath) {
    const { dir } = path.parse(filepath)
    return dir.replace('/', '')
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

  get dataCollections() {
    const dataCollections = this.config.Data.find({
      matching: ['*', '!_*'],
      files: false,
      directories: true,
      ignoreCase: true
    })
    return dataCollections.map(type => type.toLowerCase())
  }

  setFiles() {
    this.files = this.getFiles()
    return this
  }

  handleDataDirectory(directory) {
    const directoryFiles = this.getDirectoryFiles(directory)
    const allDirectoryData = {}

    directoryFiles.forEach((file) => {
      const data = yaml.safeLoad(this.config.Data.read(file)) || {}
      const fileKey = this.getFileName(file)
      allDirectoryData[fileKey] = this.transformData(fileKey, data)
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

    if (this.dataCollections) {
      this.dataCollections.forEach((directory) => {
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

  generateRoutesFile() {
    const routes = this.buildDataRoutes()
    this.config.Api.write(`routes/data.json`, routes)
    return this
  }

  transformData(fileKey, data) {
    const slug = data.slug ? data.slug : fileKey
    const title = data.title ? data.title : titleCaseText(slug)

    data.slug = slug
    data.title = title

    return data
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

  runGenerators() {
    this.generateDataApi().generateRoutesFile()
  }
};

module.exports = DataPlugin
