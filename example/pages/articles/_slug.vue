<template>
  <div>
    <nuxt-link v-for="article in $vStore.articles" :key="article.slug" :to="`/articles/${article.slug}`">
      {{ article.title }}
    </nuxt-link>
    <!-- <pre>{{ $vStore.currentContentItem }}</pre> -->
    <h1 v-text="$vStore.currentContentItem.title" />
    <img v-if="$vStore.currentContentItem.image" :src="imagePath">
    <article v-html="$vStore.currentContentItem.html" />
  </div>
</template>

<script>
// import { getPostPromise } from '@/plugins/v-store'

export default {
  // asyncData({ params, $vStore, $getPost }) {
  //   // eslint-disable-next-line no-unused-vars
  //   // const posts = $vStore.posts
  //   // const post = $vStore.posts.filter(post => post.slug === params.slug)
  //   // const article = await getPostPromise(params.slug)
  //   // eslint-disable-next-line no-console
  //   // console.log('FROM ASYNCDATA promiseData - article: ', article)

  //   // const article = $cmsApi.get('articles', params.slug)
  //   return {
  //     article: $vStore.currentContentItem
  //     // post
  //   }
  // },

  // data() {
  //   const article = this.$vStore.posts.find(post => post.slug === this.$route.params.slug)
  //   return {}
  // },
  head() {
    return {
      title: this.$vStore.currentContentItem.title,
      meta: [
        { hid: 'description', name: 'description', content: this.$vStore.currentContentItem.description || 'Default description here' }
      ]
    }
  },
  computed: {
    // article() {
    //   return this.posts.find(post => post.slug === this.$route.params.slug)
    // },
    imagePath() {
      return require(`~/assets/${this.$vStore.currentContentItem.image}`)
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
