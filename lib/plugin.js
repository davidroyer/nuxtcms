/* eslint-disable no-console */
const collectionRoutes = ['articles', 'projects']

export default (context, inject) => {
  if (context.isDev) {
    const [baseRoute] = context.route.name.split('-')

    console.log('isDev - Should inject collections and collection items')

    if (collectionRoutes.includes(baseRoute)) {
      if (context.params.slug) {
        inject(
          'collectionItem',
          require(`@/_jsonApi/${baseRoute}`)[context.params.slug].slug
        )
      } else {
        inject('getCollection', require(`@/_jsonApi/${baseRoute}`))
      }
    }
  }

  inject('get', (collection, slug) => {
    if (slug) {
      return require(`@/_jsonApi/${collection}`)[slug]
    } else {
      return require(`@/_jsonApi/${collection}`)
    }
  })
}
