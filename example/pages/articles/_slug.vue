<template>
  <div>
    <h1 v-text="article.title" />
    <hr>
    <h3>Local version: {{ Date.parse(new Date()) }}</h3>
    <article v-html="article.html" />
  </div>
</template>

<script>
export default {
  asyncData({ app, params }) {
    return {
      // date: app.$date,
      article: app.$get('articles', params.slug)
    }
  }
}
</script>
