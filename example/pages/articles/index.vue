<template>
  <div>
    <nuxt-link v-for="article in articles" :key="article.slug" :to="`/articles/${article.slug}`">
      {{ article.title }}
    </nuxt-link>
    <pre>{{ articles }}</pre>
  </div>
</template>

<script>
export default {

  asyncData({ $content }) {
    const articles = $content.get('articles')
    return { articles }

    // return {
    //   articles: $articles.all()
    // }
  }
}
</script>
