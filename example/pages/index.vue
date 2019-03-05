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
  asyncData({ app }) {
  // asyncData({ app, $mainNav, $data1, $articles }) {
    // eslint-disable-next-line no-console
    // console.log(app)

    return {
      articles: app.$get('articles'),
      // dataTest: $data1,
      // menu: $mainNav,
      menu: app.$data('main-nav'),
      mainNav: app.$data('main-nav')
      // members: app.$data('members')
    }
  }
}
</script>
