<template>
  <div>
    <!-- <pre>{{ $data('main-nav') }}</pre> -->
    <nuxt-link v-for="(route, index) in $mainNav" :key="index" :to="`${route.to}`">
      {{ route.label }}
    </nuxt-link>
    <nuxt />
  </div>
</template>

<script>
export default {

}
</script>

<style>
  body {
    /* background-color: lightgrey; */
  }
</style>
