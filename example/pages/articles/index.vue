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

  asyncData({ $content, $cmsApi }) {
    // const articles = require('@cmsApi/articles')
    // eslint-disable-next-line no-console
    // console.log('from require: ', articles)

    // const articles = $cmsApi.get('articles')
    return { articles: require('@cmsApi/articles') }
  }
}
</script>
