/* eslint-disable no-console */

import contentRoutes from '@cmsApi/routes/content'


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
      const data = require(`@cmsApi/${type}/index.json`)[slug]
      return data
    } else {
      const data = require(`@cmsApi/${type}/index.json`)
      return data
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
  }

/**
 * NOTES: This is only needed for Dev Reloading of CMS Files
 */
  function buildInjector(cmsResource) {
    const resourceKey = createKeys(cmsResource)
    const data = require(`@cmsApi/${cmsResource}`)

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
