/* eslint-disable no-console */

import routes from '@/_CMS/api/routes'
import dataRoutes from '@/_CMS/api/routes/data'

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

const contentInjectorHandler = (type, slug) => ({

  /**
   * Returns data for single content collection entry
   * @param {String} slug 
   */
  get(type, slug) {
    if (slug) {
      return require(`@/_CMS/api/${type}/index.json`)[slug]
    } else {
      return require(`@/_CMS/api/${type}/index.json`)
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
  // console.log('PLUGIN OPTIONS:', options);

  if (context.isDev) {}

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
   * 
   */
  routes.content.forEach(contentName => {
    const contentKey = createKeys(contentName)
    const data = require(`@/_CMS/api/${contentName}`)

    context[contentKey.forContext] = collectionInjector(data)
    inject([contentKey.forInjection], collectionInjector(data))
  });

  context.$content = contentInjectorHandler()
  inject('content', contentInjectorHandler())


  /**
   * Creates data on context for each data file my using the camelCase version of the filename
   */
  dataRoutes.forEach(fileName => {
    console.log('fileName: ', fileName);
    const data = require(`@/_CMS/api/${fileName}/index.json`)
    const fileKey = createKeys(fileName)

    context[fileKey.forContext] = data
    inject([fileKey.forInjection], data)
  });
}


const toCamelCase = (str) => {
  str = str.replace(/[-_\s]+(.)?/g, (match, ch) => // eslint-disable-line no-param-reassign
    (ch ? ch.toUpperCase() : '')
  )

  // Ensure first chat is always lowercase
  return str.substr(0, 1).toLowerCase() + str.substr(1)
}
