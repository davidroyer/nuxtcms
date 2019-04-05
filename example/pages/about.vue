<template>
  <div>
    <h1 v-text="page.title" />
    <div v-html="page.html" />
  </div>
</template>

<script>

export default {
  asyncData({ $cmsApi, route }) {
    // eslint-disable-next-line no-console
    console.log('route.name: ', route.name)

    return {
      page: $cmsApi.get('pages', route.name)
    }
  }
}
</script>
