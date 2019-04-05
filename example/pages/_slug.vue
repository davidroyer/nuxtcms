<template>
  <div>
    <h1 v-text="page.title" />
    <div v-html="page.html" />
  </div>
</template>

<script>

export default {
  asyncData({ $cmsApi, route, params }) {
    return {
      page: $cmsApi.get('pages', params.slug)
    }
  }
}
</script>
