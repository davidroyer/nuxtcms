<template>
  <div>
    <nuxt-link v-for="article in $vStore.articles" :key="article.slug" :to="`/articles/${article.slug}`">
      {{ article.title }}
    </nuxt-link>
    <pre>{{ $vStore.articles }}</pre>
  </div>
</template>

<script>
export default {

  asyncData({ $content, $cmsApi }) {
    // console.log('cmsApi: ', $cmsApi)

    // const articles = $content.get('articles')
    // const articles = $cmsApi.get('articles')
    // return { articles }
  }
}
</script>
