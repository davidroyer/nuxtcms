/* eslint-disable no-console */
// const contentType = route.name.replace('-slug', '')
import contentRoutes from '@/static/api/routes/content'
import { vMutations, vGetters } from '@/plugins/v-store'
import vStore from '../plugins/v-store'

const isContentRoute = (path, contentRoutes) => contentRoutes.some(route => path.includes(route))

export default function (context) {
  const { route, params } = context
  const handleContentItem = !!(process.client && params.slug && isContentRoute(route.path, contentRoutes))

  if (handleContentItem) {
    console.log('From Middleware - handleContentItem TRUE: ', context)
    const articles = context.$vStore.articles
    context.$vStore.currentArticle = articles.find(post => post.slug === params.slug)

    // const article = articles.find(post => post.slug === params.slug)
    // context.$vStore.currentArticle = { ...article }

    // vMutations.setCurrentArticle(article)
  }
}
