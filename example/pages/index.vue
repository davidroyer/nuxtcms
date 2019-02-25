<template>
  <div>
    <h2>Articles</h2>
    <pre>{{ articles }}</pre>

    <hr>

    <h2>Main Menu</h2>
    <pre>{{ menu }}</pre>
  </div>
</template>

<script>
export default {
  asyncData({ app, $mainNav, $articles }) {
    // eslint-disable-next-line no-console
    console.log(app)

    return {
      articles: $articles,
      // articles: app.$get('articles'),
      menu: $mainNav,
      mainNav: app.$data('main-nav'),
      members: app.$data('members')
    }
  }
}
</script>
