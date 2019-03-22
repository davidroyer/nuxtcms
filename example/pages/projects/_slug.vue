<template>
  <div>
    <h1 v-text="$vStore.currentContentItem.title" />
    <div v-html="$vStore.currentContentItem.html" />
  </div>
</template>

<script>
export default {
  // asyncData({ $cmsApi, params, $vStore }) {
  //   // const  = $cmsApi.get('s', params.slug)
  //   const project = $vStore.currentContentItem
  //   console.log('$vStore.currentContentItem: ', $vStore.currentContentItem)

  //   return { project }
  // }
}
</script>
