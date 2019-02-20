<template>
  <div>
    <pre>{{ articles }}</pre>
  </div>
</template>

<script>
export default {
  asyncData({ app, params }) {
    return {
      articles: app.$get('articles')
    }
  }
}
</script>

<style scoped>

</style>
