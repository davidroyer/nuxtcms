<template>
  <div>
    <h1>Page - {{ page.title }}</h1>
    <pre>{{ page }}</pre>
  </div>
</template>

<script>

export default {
  asyncData({ $cmsApi, route, params }) {
    const page = $cmsApi.get('pages', params.slug)
    return { page }
  }
}
</script>
