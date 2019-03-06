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
  asyncData({ $content, params }) {
    // const article = $articles.get(params.slug)
    const article = $content.get('articles', params.slug)
    return { article }
  },
  head() {
    return {
      title: this.article.title,
      meta: [
        { hid: 'description', name: 'description', content: this.article.description || 'Default description here' }
      ]
    }
  }
}
</script>
