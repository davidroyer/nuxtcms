<template>
  <div>
    <nuxt-link v-for="article in vArticles" :key="article.slug" :to="`/articles/${article.slug}`">
      {{ article.title }}
    </nuxt-link>
    <pre>{{ vArticles }}</pre>
  </div>
</template>

<script>
export default {
  computed: {
    vArticles() {
      return this.$getContent('articles')
    }
  }
}
</script>
