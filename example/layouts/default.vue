<template>
  <div>
    <Nav />
    <h2>DataApi</h2>
    <pre>{{ $dataApi }}</pre>

    <nuxt />
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
