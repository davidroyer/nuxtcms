<template>
  <div>
    <pre>{{ articles }}</pre>
  </div>
</template>

<script>
export default {
  asyncData({ app }) {
    return {
      articles: app.$get('articles')
    }
  }
}
</script>
