const { arrayFromObject } = require('utils')
class ContentCollection {
  constructor(config) {
    this.config = config

    this.data = {}
  }

  get collections() {
    return this.config.Content.find({
      matching: ['*', '!_*'],
      files: false,
      directories: true
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

  generateCollection() {
    this.files.forEach((file) => {
      try {
        this.generateApiFile(file)
      } catch (e) {}
    })

    // this.handleTags()
    return this
  }

  arrayFromObject
}

module.exports = ContentCollection
