<template>
  <div>
    <pre>{{ $vStore.currentContentItem }}</pre>

    <Nav />
    <nuxt />
    <hr>
  </div>
</template>

<script>
import Nav from '@/components/Nav'
export default {
  components: { Nav }
}
</script>

<style>

</style>
