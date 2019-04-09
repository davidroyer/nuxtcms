/* eslint-disable no-console */

import contentRoutes from '@cmsApi/routes/content'
import dataRoutes from '@cmsApi/routes/data'

/**
 * Injects data for content collection
 * @param {DataCollection} data 
 */
const collectionInjector = (data) => ({

  /**
   * Returns all data for collection
   */
  all() {
    return data
  },

  /**
   * Returns data for single content collection entry
   * @param {String} slug 
   */
  get(slug) {
    return data[slug]
  }
})

/**
 *  Allows content to be accessed from `$content`
 * @param {String} type Content type
 * @param {String} slug Optional slug if single entry requested
 * 
 * @demo
 * ```js
 * asyncData({$content}) {
 *  return {
 *    projects: $content.get('projects')
 *  }
 * }
 * ```
 */



const apiInjectorHandler = (context, type, slug) => ({
  
  getContext(context) {
    return context
  },
  /**
   * Returns data for single content collection entry
   * @param {String} slug 
   */
  get(type, slug) {

    if (slug) {
      return require(`@cmsApi/${type}/index.json`)[slug]
    } else {
      return require(`@cmsApi/${type}/index.json`)
    }
  }
})

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

  /**
   * Create access for each content collection
   * Can get entire collection via `.all()` or single via `.get(slug)` and passing the `params.slug`
   * 
   * @demo
   * ```js
   * asyncData({$articles}) {
   * const articles = context.$articles
   *  return {
   *    articles: $articles.all()
   *  }
   * }
   * ``` 
   */


  /**
   * Creates data on context for each data file my using the camelCase version of the filename
   */
  context.$cmsApi = apiInjectorHandler(context)
  inject('cmsApi', apiInjectorHandler(context))

  if (context.isDev) {
    contentRoutes.forEach(contentType => buildInjector(contentType));
    dataRoutes.forEach(dataResource => buildInjector(dataResource));
  }

  function buildInjector(cmsResource) {
    const resourceKey = createKeys(cmsResource)
    const data = require(`@cmsApi/${cmsResource}`)
  
    context[resourceKey.forContext] = collectionInjector(data)
    inject([resourceKey.forInjection], collectionInjector(data))
  }  
}



const toCamelCase = (str) => {
  str = str.replace(/[-_\s]+(.)?/g, (match, ch) => // eslint-disable-line no-param-reassign
    (ch ? ch.toUpperCase() : '')
  )
  // Ensure first chat is always lowercase
  return str.substr(0, 1).toLowerCase() + str.substr(1)
}
