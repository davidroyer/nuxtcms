<template>
  <div>
    <h1 v-text="project.title" />
    <pre>{{ project }}</pre>
  </div>
</template>

<script>
export default {
  asyncData({ $cmsApi, params }) {
    const project = $cmsApi.get('projects', params.slug)
    return { project }
  }
}
</script>
