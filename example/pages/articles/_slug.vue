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
  asyncData({ $cmsApi, $content, params }) {
    const article = $cmsApi.$get('articles', params.slug)
    const file7 = $cmsApi.file7
    // const article = $content.get('articles', params.slug)
    return { article, file7 }
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
