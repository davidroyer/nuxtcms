/* eslint-disable no-unused-vars */
/* eslint-disable require-await */
// const { resolve } = require('path')

async function nuxtModule(moduleOptions) {
  const defaults = {}
  const options = Object.assign({}, defaults, moduleOptions, this.options.nuxtcms)
  // this.addPlugin({
  //   src: resolve(__dirname, 'plugin.js'),
  //   fileName: 'nuxtcms.js',
  //   options
  // })
}

module.exports = nuxtModule
module.exports.meta = require('../package.json')
