<template>
  <div>
    <nuxt-link v-for="(route, index) in nav" :key="index" :to="`${route.to}`">
      {{ route.label }}
    </nuxt-link>
  </div>
</template>

<script>
export default {
  computed: {
    nav() {
      return this.$cmsApi.get('nav-menu')
    }
  }
}
</script>
