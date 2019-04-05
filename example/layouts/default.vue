<template>
  <div>
    <Nav />
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
.page-enter-active, .page-leave-active {
  transition: opacity .35s
}
.page-enter, .page-leave-active {
  opacity: 0
}
</style>
