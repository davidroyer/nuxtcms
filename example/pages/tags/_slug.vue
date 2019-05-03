<template>
  <div>
    <h1 v-text="tag.title" />
    <pre>{{ tag }}</pre>
  </div>
</template>

<script>
export default {

  asyncData({ $cmsApi, params }) {
    const tag = $cmsApi.get('blog/tags', params.slug)
    return { tag }
  },

  head() {
    return {
      title: this.tag.title
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
