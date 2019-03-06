/* eslint-disable no-console */

import routes from '@/_CMS/api/routes'
import dataRoutes from '@/_CMS/api/routes/data'

/**
 * Injects data for content collection
 * @param {DataCollection} data 
 */
const contentInjector = (data) => ({

  /**
   * Returns all data for collection
   */
  all() { return data },

  /**
   * Returns data for single content collection entry
   * @param {String} slug 
   */
  get(slug) { return data[slug] }
})

const dataInjectorNew = (data) => ({
  // all() { return data },
  get(file) { return require(`@/_CMS/api/${dataFile}/index.json`) }
})

const dataInjector = (file) => {
  return require(`@/_CMS/api/${file}/index.json`)
}


/**
 * 
 * @param {String} key Name of the property key to use
 * @param {Boolean} appendDollarSign
 */
const createKeys = (key) => {
  return {
    forContext: '$' + toCamelCase(key),
    forInjection: toCamelCase(key)
  }
}


export default (context, inject) => {
  const options = JSON.parse('<%= serialize(options) %>')
  console.log('PLUGIN OPTIONS:', options);
  
  if (context.isDev) {}

  routes.content.forEach(contentName => {
    const contentKey = createKeys(contentName)
    const data = require(`@/_CMS/api/${contentName}`)
    
    context[contentKey.forContext] = contentInjector(data)
    inject([contentKey.forInjection], contentInjector(data))
  });


  dataRoutes.forEach(fileName => {
    console.log('fileName: ', fileName);
    const data = require(`@/_CMS/api/${fileName}/index.json`)
    const fileKey = createKeys(fileName)
    
    context[fileKey.forContext] = data
    inject([fileKey.forInjection], data)
  });
  

  // dataRoutes.forEach(fileName => {
  //   const data = require(`@/_CMS/api/${fileName}/index.json`)
  //   context[createKeys(fileName)] = data
  //   inject([fileName], data)
  // });
  
  // inject('get', (collection, slug) => {
  //   if (slug) {
  //     return require(`@/_CMS/api/${collection}/index.json`)[slug]
  //   } else {
  //     return require(`@/_CMS/api/${collection}/index.json`)
  //   }
  // })

  inject('data', (file) => {
    return require(`@/_CMS/api/${file}/index.json`)
  })

  // context.data = dataInjector(file)
  // inject('data', dataInjector(file))


}


const toCamelCase = (str) => {
  str = str.replace(/[-_\s]+(.)?/g, (match, ch) => // eslint-disable-line no-param-reassign
    (ch ? ch.toUpperCase() : '')
  )

  // Ensure first chat is always lowercase
  return str.substr(0, 1).toLowerCase() + str.substr(1)
}