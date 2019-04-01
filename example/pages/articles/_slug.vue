<template>
  <div class="article-wrapper">
    <nuxt-link v-for="blogArticle in articles" :key="blogArticle.slug" :to="`/articles/${blogArticle.slug}`">
      {{ blogArticle.title }}
    </nuxt-link>
    <h2>CURRENT ITEM</h2>
    <pre>{{ article }}</pre>
    <h1 v-text="article.title" />
    <img v-if="article.image" :src="imagePath">
    <article v-html="article.html" />
  </div>
</template>

<script>

export default {
  computed: {
    article() {
      // return this.$getContent('articles', this.$route.params.slug)
      return this.$vStore.currentContentItem
    },

    imagePath() {
      return require(`~/assets/${this.article.image}`)
    }
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

<style>
  img {
    max-width: 800px;
  }
  .article-wrapper {
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
  }

</style>
<style src="@@/lib/assets/blog-styles.css"></style>
<style src="@@/node_modules/prismjs/themes/prism-tomorrow.css">
