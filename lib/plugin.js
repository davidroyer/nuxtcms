/* eslint-disable no-console */

import routes from '@/static/api/routes'

export default (context, inject) => {
  if (context.isDev) {}

  routes.content.forEach(collection => {
    const data = require(`@/static/api/content/${collection}`)
    context[`$${toCamelCase(collection)}`] = data
    inject([collection], data)
  });

  routes.data.forEach(dataFile => {
    const data = require(`@/static/api/data/${dataFile}`)
    context[`$${toCamelCase(dataFile)}`] = data
    inject([toCamelCase(dataFile)], data)
  });
  
  inject('get', (collection, slug) => {
    if (slug) {
      return require(`@/static/api/content/${collection}/index.json`)[slug]
    } else {
      return require(`@/static/api/content/${collection}/index.json`)
    }
  })

  inject('data', (file) => {
    return require(`@/static/api/data/${file}`)
  })

}


const toCamelCase = (str) => {
  str = str.replace(/[-_\s]+(.)?/g, (match, ch) => // eslint-disable-line no-param-reassign
    (ch ? ch.toUpperCase() : '')
  )

  // Ensure first chat is always lowercase
  return str.substr(0, 1).toLowerCase() + str.substr(1)
}