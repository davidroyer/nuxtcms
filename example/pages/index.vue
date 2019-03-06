<template>
  <div>
    <h2>Articles</h2>
    <pre>{{ articles }}</pre>

    <hr>

    <h2>Main Menu</h2>
    <pre>{{ mainMenu }}</pre>
  </div>
</template>

<script>
export default {
  asyncData({ app, $articles, $mainNav, $mainMenu }) {
    return {
      articles: $articles.all(),
      mainMenu: $mainMenu,
      mainNav: $mainNav
      // members: app.$data('members')
    }
  }
}
</script>
