<template>
  <div>
    <h1 v-text="$vStore.currentContentItem.title" />
    <div v-html="$vStore.currentContentItem.html" />
  </div>
</template>

<script>
export default {
  asyncData({ $getContent, params, $vStore }) {
    return { project: $getContent('projects', params.slug) }
  }
}
</script>
