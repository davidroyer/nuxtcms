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
      return this.$store.state.menu
    }
  },

  mounted() {
    // eslint-disable-next-line no-console
    console.log('from component - $data test', this.$dataApi)
    // eslint-disable-next-line no-console
    console.log('from component - articles test', this.$mainMenu)
  }
}
</script>

<style scoped>

</style>
