/* eslint-disable no-console */

import routes from '@/_CMS/api/routes'
import dataRoutes from '@/_CMS/api/routes/data'

export default (context, inject) => {
  const options = JSON.parse('<%= serialize(options) %>')
  console.log('PLUGIN OPTIONS:', options);
  
  if (context.isDev) {}

  routes.content.forEach(collection => {
    const data = require(`@/_CMS/api/${collection}`)
    context[`$${toCamelCase(collection)}`] = data
    inject([collection], data)
  });

  dataRoutes.forEach(dataFile => {
    console.log('dataFile: ', dataFile);
    
    const data = require(`@/_CMS/api/${dataFile}/index.json`)
    context[`$${toCamelCase(dataFile)}`] = data
    inject([toCamelCase(dataFile)], data)
  });
  
  inject('get', (collection, slug) => {
    if (slug) {
      return require(`@/_CMS/api/${collection}/index.json`)[slug]
    } else {
      return require(`@/_CMS/api/${collection}/index.json`)
    }
  })

  inject('data', (file) => {
    return require(`@/_CMS/api/${file}/index.json`)
  })

}


const toCamelCase = (str) => {
  str = str.replace(/[-_\s]+(.)?/g, (match, ch) => // eslint-disable-line no-param-reassign
    (ch ? ch.toUpperCase() : '')
  )

  // Ensure first chat is always lowercase
  return str.substr(0, 1).toLowerCase() + str.substr(1)
}