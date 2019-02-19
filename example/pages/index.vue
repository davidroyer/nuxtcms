<template>
  <div>
    <!-- <div v-html="article.html" /> -->
    <!-- <pre>{{ projects }}</pre> -->
    <pre>{{ articles }}</pre>
  </div>
</template>

<script>
// import articles from '@/_jsonApi/articles'
// const article = articles['article-1']
export default {
  asyncData({ app, params }) {
    return {
      // articless
      // projects: app.$get('projects'),
      articles: app.$get('articles')
      // article: app.$get('articles', 'article-1')
    }
  }
  // data: () => ({
  //   articles,
  //   article
  // })
}
</script>
