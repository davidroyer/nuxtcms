<template>
  <div>
    <h1>Page - {{ page.title }}</h1>
    <pre>{{ page }}</pre>
    <!-- <h1 v-text="page.title" />
    <div v-html="page.html" /> -->
  </div>
</template>

<script>

export default {
  asyncData({ $cmsApi, route, params }) {
    const page = $cmsApi.get('pages', params.slug)
    if (page.markdown) page.md = $cmsApi.get('markdown', page.markdown)
    return { page }
  }
}
</script>
