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

  asyncData({ $cmsApi }) {
    return { articles: $cmsApi.get('blog') }
  }
}
</script>
