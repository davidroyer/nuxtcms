<template>
  <div>
    <h1 v-text="article.title" />
    <article v-html="article.html" />
  </div>
</template>

<script>
export default {
  asyncData({ app, params }) {
    return {
      article: app.$get('articles', params.slug)
    }
  }
}
</script>
