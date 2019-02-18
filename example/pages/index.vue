<template>
  <div>
    <div v-html="article.html" />
    <pre>{{ articles }}</pre>
  </div>
</template>

<script>
import articles from '@/_jsonApi/articles'
const article = articles['article-1']
export default {
  data: () => ({
    articles,
    article
  })
}
</script>
