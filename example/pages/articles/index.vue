<template>
  <div>
    <nuxt-link v-for="article in $vStore.articles" :key="article.slug" :to="`/articles/${article.slug}`">
      {{ article.title }}
    </nuxt-link>
    <pre>{{ $vStore.articles }}</pre>
  </div>
</template>

<script>
export default {

}
</script>
