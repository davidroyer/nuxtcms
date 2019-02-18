<template>
  <div>
    <div v-html="article.html" />
    <!-- <pre>{{ projects }}</pre> -->
    <pre>{{ articles }}</pre>
  </div>
</template>

<script>
import articles from '@/_jsonApi/articles'
const article = articles['article-1']
export default {
  asyncData({ app, params }) {
    // return {
    //   projects: app.$get('projects')
    // }
  },
  data: () => ({
    articles,
    article
  })
}
</script>
