<template>
  <div>
    <h1 v-text="project.title" />
    <div v-html="project.html" />
  </div>
</template>

<script>
export default {
  asyncData({ $projects, params }) {
    const project = $projects.get(params.slug)
    return { project }
  }
}
</script>
