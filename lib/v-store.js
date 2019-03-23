/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import Vue from 'vue'
import io from 'socket.io-client'
import contentRoutes from '@/static/api/routes/content'

const arrayFromObject = object =>
  Object.keys(object).map(key => object[key])

const vStore = Vue.observable({
  currentContentItem: {},
  allContent: []
})

if (!process.env.DEV_MODE) {
  console.log('Registered Not In Dev Mode...')

  contentRoutes.forEach((route) => {
    const data = require(`@/static/api/${route}/index.json`)
    vStore[route] = arrayFromObject(data)
  })
}

export const socket = io(process.env.WS_URL)

export const getContentPromise = slug =>
  new Promise((resolve) => {
    socket.emit('get-posts', function (dataResponse) {
      return resolve(dataResponse)
    })
  })

const isContentRoute = (path, contentRoutes) => contentRoutes.some(route => path.includes(route))

export default async (context, inject) => {
  if (context.isDev) {
    console.log('JSON content from Socket')
    const contentObject = await getContentPromise()

    for (const key in contentObject) {
      vStore[key] = contentObject[key]
    }
  } else {
    await Promise.resolve()
  }

  const { route, params } = context
  const isContentItemRoute = !!(params.slug && isContentRoute(route.path, contentRoutes))

  if (isContentItemRoute) {
    const contentType = route.name.replace('-slug', '')
    vStore.currentContentItem = vStore[contentType].find(post => post.slug === params.slug)
    console.log('Just set currentContentItem')
  }

  if (process.env.DEV_MODE && process.client) {
    console.log('FROM PLUGIN CLIENT SIDE - HANDLE CLIENT SIDE UPDATES')

    socket.on('file-update', function (data, updatedContentType) {
      const currentContentRoute = context.route.name.replace('-slug', '')
      const onUpdatedContentRoute = updatedContentType === currentContentRoute

      vStore[updatedContentType] = data

      if (isContentItemRoute && onUpdatedContentRoute) {
        vStore.currentContentItem = vStore[updatedContentType].find(item => item.slug === context.params.slug)
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
    console.log('context.$getContent')
    vStore.currentContentItem = vStore[contentType].find(contentType => contentType.slug === slug)
    return vStore.currentContentItem
  }

  inject('getContent', (contentType, slug) => {
    vStore.currentContentItem = vStore[contentType].find(contentType => contentType.slug === slug)
    return vStore.currentContentItem
  })
}
