<template>
  <div>
    <h1 v-text="article.title" />
    <div v-if="article.tags" class="article-tags">
      <div v-for="tag in article.tagsData" :key="tag.slug" class="article-tag">
        <nuxt-link :to="`/tags/${tag.slug}`">
          <small v-text="tag.title" />
        </nuxt-link>
      </div>
    </div>

    <img v-if="article.image" :src="imagePath">
    <article v-html="article.html" />
  </div>
</template>

<script>
export default {

  computed: {
    imagePath() {
      return require(`~/assets/${this.article.image}`)
    }
  },
  asyncData({ $cmsApi, params }) {
    const article = $cmsApi.get('blog', params.slug)
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

<style>
img {
  max-width: 800px;
}

</style>
<style src="@@/lib/assets/blog-styles.css"></style>
<style src="@@/node_modules/prismjs/themes/prism-tomorrow.css">
