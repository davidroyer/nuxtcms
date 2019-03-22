/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import Vue from 'vue'
import io from 'socket.io-client'
// import contentRoutes from '@/static/api/routes/content'

const socket = io(process.env.WS_URL)
console.log('TCL: socket', socket)

const vStore = Vue.observable({
  posts: []
})

socket.on('file-update', (data) => {
  console.log('TCL: file-update, (data)', (data))
  vStore.posts = data
})

export default (context, inject) => {
  const { route, params } = context
  console.log('FROM V-STORES: ')
  console.log('route: ', route)
  console.log('params: ', params)

  context.$vStore = vStore
  inject('vStore', vStore)
}

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
