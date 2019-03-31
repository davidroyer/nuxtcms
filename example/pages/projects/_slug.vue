<template>
  <div>
    <h1 v-text="project.title" />
    <div v-html="project.html" />
    <!-- <h1 v-text="$vStore.currentContentItem.title" />
    <div v-html="$vStore.currentContentItem.html" /> -->
  </div>
</template>

<script>
export default {
  // asyncData({ params, $getContent }) {
  //   return { project: $getContent('projects', params.slug) }
  // },

  computed: {
    project() {
      return this.$getContent('projects', this.$route.params.slug)
    }
  },

  head() {
    return {
      title: this.project.title,
      meta: [
        { hid: 'description', name: 'description', content: this.project.description || 'Default description here' }
      ]
    }
  }
}
</script>
