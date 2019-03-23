<template>
  <div>
    <pre>{{ $vStore.currentContentItem }}</pre>

    <Nav />
    <nuxt />
    <hr>
  </div>
</template>

<script>
import Nav from '@/components/nav'
export default {
  components: { Nav }
}
</script>

<style>

</style>
