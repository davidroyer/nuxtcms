
import path from 'path'

export default async function (ctx, inject) {
  // console.log('CTX: ', ctx);
  let slug

  if (ctx.params.slug) slug = ctx.params.slug
  else slug = null
  inject('slug', slug)

  const options = <%= JSON.stringify(options, null, 2) %>;
  const apiDirectory = '<%= options.apiDirectory %>';
  const nuxtSrcDir = '<%= options.nuxtSrcDir %>';
  const pathToSrcDir = '<%= options.pathToSrcDir %>';
  // const apiDirectoryPath = '<%= options.apiDirectoryPath %>'
  // const apiDirectory = '_jsonApi'
  const pathToUse = path.relative('', nuxtSrcDir)
  console.log('pathToUse: ', pathToUse);
  // const currentDir = path.resolve(__dirname)
  // console.log(currentDir);
  
  // const test = require(`@/${apiDirectory}/articles`)
  // const test = require(`../example/_jsonApi/${collection}`)

  ctx.$apiDirectory = apiDirectory
  inject('apiDirectory', apiDirectory)
  // inject('get', (collection, slug) => {
  //   if (slug) {
  //     const collectionItem = require(`@@/${pathToSrcDir}/${apiDirectory}/${collection}`)[slug]
  //     return collectionItem
  //   } else {
  //     const collection = require(`@@/${pathToSrcDir}/${apiDirectory}/${collection}`)
  //     return collection
  //     // return require(`@/${apiDirectory}/${collection}`)
  //   }
  // })

}
