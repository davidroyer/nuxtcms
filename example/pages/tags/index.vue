<template>
  <div>
    <h1>All Tags</h1>
    <nuxt-link v-for="(tag, tagKey) in tags" :key="tagKey" :to="`/tags/${tag.slug}`">
      {{ tag.title }}
    </nuxt-link>
    <pre>{{ tags }}</pre>
  </div>
</template>

<script>
export default {
  asyncData({ $cmsApi }) {
    const tags = $cmsApi.get('blog/tags')
    return { tags }
  }
}
</script>
