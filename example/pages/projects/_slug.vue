<template>
  <div>
    <h1 v-text="project.title" />
    <div v-html="project.html" />
  </div>
</template>

<script>
export default {
  asyncData({ app, params }) {
    return {
      project: app.$get('projects', params.slug)
    }
  }
}
</script>
