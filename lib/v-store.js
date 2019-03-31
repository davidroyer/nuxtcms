/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import Vue from 'vue'
import io from 'socket.io-client'
import contentTypeRoutes from '@/_api/routes/content'

const isDev = process.env.DEV_MODE
const arrayFromObject = object =>
  Object.keys(object).map(key => object[key])

const contentTypes = []
if (isDev) {
  console.log('Is Dev')
  contentTypeRoutes.forEach((type) => {
    contentTypes[type] = []
  })
} else {
  console.log('Is NOT Dev')
  contentTypeRoutes.forEach((type) => {
    const data = require(`@/_api/${type}/index.json`)
    contentTypes[type] = arrayFromObject(data)
  })
}

const vStore = Vue.observable({
  ...contentTypes,
  currentContentItem: {},
  allContent: []
})

export const socket = isDev ? io(process.env.WS_URL) : {}

export const getContentPromise = () =>
  new Promise((resolve) => {
    console.log('getContentPromise')

    socket.emit('get-content', function (dataResponse) {
      return resolve(dataResponse)
    })
  })

const isContentRoute = (path, contentTypeRoutes) => contentTypeRoutes.some(route => path.includes(route))

export default async (context, inject) => {
  if (context.isDev) {
    console.log('JSON content from Socket')
    const allContentTypes = await getContentPromise()

    for (const contentType in allContentTypes) {
      const contentData = allContentTypes[contentType]
      vStore[contentType] = contentData
    }
  } else await Promise.resolve()

  const {
    route,
    params
  } = context
  const isContentItemRoute = !!(params.slug && isContentRoute(route.path, contentTypeRoutes))
  if (isContentItemRoute) {
    const contentType = route.name.replace('-slug', '')
    vStore.currentContentItem = vStore[contentType].find(post => post.slug === params.slug)
    console.log('Just set currentContentItem')
  }

  if (isDev && process.client) {
    console.log('FROM PLUGIN CLIENT SIDE - HANDLE CLIENT SIDE UPDATES')

    socket.on('file-update', function (data, updatedContentType) {
      console.log('TCL: updatedContentType1', updatedContentType)
      console.log('TCL: file-update - DATA', data)
      const currentContentRoute = context.route.name.replace('-slug', '')
      const onUpdatedContentRoute = updatedContentType === currentContentRoute

      vStore[updatedContentType] = data
      context.$vStore[updatedContentType] = data
      if (isContentItemRoute && onUpdatedContentRoute) {
        console.log('process.client - isContentItemRoute: ', isContentItemRoute)
        vStore[updatedContentType] = data
        console.log('TCL: updatedContentType2', updatedContentType)
        console.log('TCL: updatedContentType - DATA', data)
        vStore.currentContentItem = vStore[updatedContentType].find(item => item.slug === params.slug)
      }
    })
  }

  /**
   *
   * INJECTIONS
   * **********************************
   */
  context.$vStore = vStore
  inject('vStore', vStore)

  context.$getContent = (contentType, slug) => {
    console.log('TCL: context.$getContent -> context.$vStore.currentContentItem', context.$vStore.currentContentItem)
    return context.$vStore.currentContentItem
    // console.log('context.$getContent')
    // return vStore[contentType].find(contentType => contentType.slug === slug)
    // vStore.currentContentItem = vStore[contentType].find(contentType => contentType.slug === slug)
    // return vStore.currentContentItem
  }

  inject('getContent', (contentType, slug) => {
    console.log('TCL: inject.$getContent -> context.$vStore.currentContentItem', context.$vStore.currentContentItem)
    return context.$vStore.currentContentItem
    // vStore.currentContentItem = vStore[contentType].find(contentType => contentType.slug === slug)
    // return vStore.currentContentItem
  })
}

/**
 * CREATE CONTENT TO BE AVAILABLE AS COMPUTED PROPERTIES
 * **********************************
 */
const computedData = {}

contentTypeRoutes.forEach((type) => {
  console.log('Building computed properties for Vue Mixin')

  computedData[type] = function () {
    return this.$vStore[type]
  }
})

Vue.mixin({
  computed: computedData
})
