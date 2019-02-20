/* eslint-disable no-console */
const collectionRoutes = ['articles', 'projects']

export default (context, inject) => {
  // if (context.isDev) {
  //   const [baseRoute] = context.route.name.split('-')

  //   if (collectionRoutes.includes(baseRoute)) {
  //     if (context.params.slug) {
  //       inject(
  //         'collectionItem',
  //         require(`@/static/api/${baseRoute}`)[context.params.slug].slug
  //       )
  //     } else {
  //       inject('getCollection', require(`@/static/api/${baseRoute}`))
  //     }
  //   } else {
  //     collectionRoutes.forEach(collection => {
  //       inject([collection], require(`@/static/api/${collection}`))
  //     });
  //   }
  // }
  collectionRoutes.forEach(collection => {
    inject([collection], require(`@/static/api/${collection}`))
  });
  inject('get', (collection, slug) => {
    if (slug) {
      return require(`@/static/api/${collection}`)[slug]
    } else {
      return require(`@/static/api/${collection}`)
    }
  })
}
