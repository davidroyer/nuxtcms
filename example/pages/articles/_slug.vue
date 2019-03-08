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
  asyncData({ $cmsApi, params }) {
    const article = $cmsApi.get('articles', params.slug)
    const mainNav = $cmsApi.get('main-nav')
    return { article, mainNav }
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
