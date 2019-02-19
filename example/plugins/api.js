/* eslint-disable no-console */
// import * as api from '@/services/api'
// import CollectionsApi from '@/services/api'

export default (context, inject) => {
  // const {
  //   // $apiDirectory,
  //   params
  // } = context
  let slug
  if (context.params.slug) slug = context.params.slug
  else slug = null
  inject('slug', slug)
  console.log('$apiDirectory: ', context.$apiDirectory)

  // eslint-disable-next-line no-unused-vars

  inject('get', (collection, slug) => {
    if (slug) {
      return require(`@/_jsonApi/${collection}`)[slug]
    } else {
      return require(`@/_jsonApi/${collection}`)
    }
  })

  // inject('get', (collection, slug) => get(collection, slug))

// inject('getPost', slug => require(`@/_jsonApi/blog`)[slug])
// inject('getPosts', () => require(`@/_jsonApi/blog`))
}
