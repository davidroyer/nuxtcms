/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import Vue from 'vue'
import io from 'socket.io-client'
import contentRoutes from '@/static/api/routes/content'

const arrayFromObject = object =>
  Object.keys(object).map(key => object[key])

const content = []
contentRoutes.forEach((route) => {
  const data = require(`@/static/api/${route}/index.json`)
  content[route] = arrayFromObject(data)
})

const vStore = Vue.observable({
  ...content,
  currentContentItem: {},
  allContent: []
})

console.log('FROM V-STORE IN MODULE')

export const socket = io(process.env.WS_URL)

export const getPostPromise = slug =>
  new Promise((resolve) => {
    console.log('getPostPromise')

    socket.emit('get-post', slug, function (dataResponse) {
      // console.log('FROM DATA-PROVIDER: ', dataResponse)
      return resolve(dataResponse)
    })
  })

export const getContentPromise = () =>
  new Promise((resolve) => {
    console.log('getContentPromise')

    socket.emit('get-content', function (dataResponse) {
    // console.log('FROM DATA-PROVIDER: ', dataResponse)
      return resolve(dataResponse)
    })
  })

export const getPostsPromise = slug =>
  new Promise((resolve) => {
    console.log('getPostsPromise')

    socket.emit('get-posts', function (dataResponse) {
      // console.log('FROM DATA-PROVIDER: ', dataResponse)
      return resolve(dataResponse)
    })
  })
export function getPost(slug) {
  socket.emit('get-post', slug, function (dataResponse) {
    console.log('TCL: GETPOST -> dataResponse', dataResponse)
    return dataResponse
  })
}

const isContentRoute = (path, contentRoutes) => contentRoutes.some(route => path.includes(route))

// export default (context, inject) => {
export default async (context, inject) => {
  const allContentTypes = await getContentPromise()
  console.log('allContentTypes: ', allContentTypes)

  vStore.allContent = allContentTypes
  const {
    route,
    params
  } = context
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
        console.log('process.client - isContentItemRoute: ', isContentItemRoute)
        vStore.currentContentItem = vStore[updatedContentType].find(item => item.slug === params.slug)
      }
    })
  }

  context.$vStore = vStore
  inject('vStore', vStore)

  /**
   * *************************
   */

  context.$getPost = function (slug) {
    console.log('$getPost is running: ', slug)

    socket.emit('get-post', slug, function (dataResponse) {
      console.log('TCL: context.$getPost -> dataResponse', dataResponse)
      return dataResponse
    })
  }
  // inject('getPost', (slug) => {
  //   console.log('getPost: slug', slug)
  //   socket.emit('get-post', slug, (dataResponse) => {
  //     console.log('TCL: dataResponse', dataResponse)
  //     return dataResponse
  //   })
  // })

  // context.$getPosts = () => {
  //   socket.emit('get-posts', (dataResponse) => {
  //     return dataResponse
  //   })
  // }
  // inject('getPosts', () => {
  //   socket.emit('get-posts', (dataResponse) => {
  //     return dataResponse
  //   })
  // })

  const vMutations = {
    setCollection(data) {
      // vStore.posts = data
    }
  }

  const vActions = {
    get(path) {
      const data = path => import(`@/static/api/${path}/index.json`).then(m => m.default || m)
    }
  }
}
