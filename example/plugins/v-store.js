/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import Vue from 'vue'
import io from 'socket.io-client'
import contentRoutes from '@/static/api/routes/content'
console.log('FROM V-STORE IN EXAMPLES/PLUGINS')

export const socket = io(process.env.WS_URL)

const vStore = Vue.observable({
  posts: [],
  post: {},
  articles: [],
  currentArticle: {}
})

export const getPostPromise = slug =>
  new Promise((resolve) => {
    console.log('getPostPromise')

    socket.emit('get-post', slug, function (dataResponse) {
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

// socket.on('file-update', (data) => {
//   console.log('UPDATED!!')

//   // console.log('TCL: file-update, (data)', data)
//   vStore.posts = data

//   // console.log('vStore.posts: ', vStore.posts)
// })

const isContentRoute = (path, contentRoutes) => contentRoutes.some(route => path.includes(route))

export default async (context, inject) => {
  const articles = await getPostsPromise()
  vStore.articles = [...articles]
  const { route, params } = context
  const handleContentItem = !!(params.slug && isContentRoute(route.path, contentRoutes))
  if (handleContentItem) {
    vStore.currentArticle = await getPostPromise(params.slug)
    console.log('Just set currentArticle')
  }

  if (process.client) {
    console.log('FROM PLUGIN CLIENT SIDE - HANDLE CLIENT SIDE UPDATES')
    socket.on('file-update', function (data, filename) {
      const contentType = route.name.replace('-slug', '')
      const article = data.find(post => post.slug === context.route.params.slug)
      vStore.currentArticle = article
      vStore.articles = data
    })
  }

  context.$vStore = vStore
  inject('vStore', vStore)
  context.$postTest = vStore.posts
  inject('postTest', vStore.posts)

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

  context.$getPosts = () => {
    socket.emit('get-posts', (dataResponse) => {
      return dataResponse
    })
  }
  inject('getPosts', () => {
    socket.emit('get-posts', (dataResponse) => {
      return dataResponse
    })
  })

  const vMutations = {
    setCollection(data) {
      vStore.posts = data
    }
  }

  const vActions = {
    get(path) {
      const data = path => import(`@/static/api/${path}/index.json`).then(m => m.default || m)
    }
  }
}
