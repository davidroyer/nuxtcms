<template>
  <div>
    <pre>{{ $data }}</pre>

    <nuxt-link v-for="(route, index) in $data.mainMenu" :key="index" :to="`${route.to}`">
      {{ route.label }}
    </nuxt-link>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>

</style>
