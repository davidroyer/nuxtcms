<template>
  <div>
    <h2>Data File Example</h2>
  </div>
</template>

<script>

export default {
  asyncData({ $cmsApi, $articles }) {
    return {
      articles: $cmsApi.get('blog'),
      pages: $cmsApi.get('pages')
    }
  }
}
</script>
