const { arrayFromObject } = require('utils')

class ContentCollection {
  constructor(config) {
    this.config = config
    this.files = []
    this.data = {}
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
  get(path) {}

  arrayFromObject
}

module.exports = ContentCollection
