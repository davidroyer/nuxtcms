<template>
  <div>
    <h1 v-text="article.title" />
    <img v-if="article.image" :src="imagePath">
    <article v-html="article.html" />
  </div>
</template>

<script>
export default {
  asyncData({ $cmsApi, params }) {
    const article = $cmsApi.get('articles', params.slug)
    return { article }
  },
  head() {
    return {
      title: this.article.title,
      meta: [
        { hid: 'description', name: 'description', content: this.article.description || 'Default description here' }
      ]
    }
  },
  computed: {
    imagePath() {
      return require(`~/assets/${this.article.image}`)
    }
  }
}
</script>

<style>
img {
  max-width: 800px;
}
.custom-block .custom-block-title {
  font-weight: 600;
  margin-bottom: -0.4rem;
}
.custom-block.danger,
.custom-block.tip,
.custom-block.warning {
  padding: 0.1rem 1.5rem;
  border-left-width: 0.5rem;
  border-left-style: solid;
  margin: 1rem 0;
}
.custom-block.tip {
  background-color: #f3f5f7;
  border-color: #42b983;
}
.custom-block.warning {
  background-color: rgba(255, 229, 100, 0.3);
  border-color: #e7c000;
  color: #6b5900;
}
.custom-block.warning .custom-block-title {
  color: #b29400;
}
.custom-block.warning a {
  color: #2c3e50;
}
.custom-block.danger {
  background-color: #ffe6e6;
  border-color: #c00;
  color: #4d0000;
}
.custom-block.danger .custom-block-title {
  color: #900;
}
.custom-block.danger a {
  color: #2c3e50;
}
</style>
