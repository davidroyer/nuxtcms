<template>
  <div>
    <h2>vStore Posts</h2>
    <pre>{{ $vStore.currentArticle }}</pre>

    <br><hr><br>
    <!--
    <h2>Articles</h2>
    <pre>{{ articles }}</pre>

    <br><hr><br>

    <h2>Main Menu</h2>
    <pre>{{ mainMenu }}</pre> -->
  </div>
</template>

<script>
export default {

  mounted() {
    // eslint-disable-next-line no-console
    console.log(this.$vStore)
  }
  // asyncData({ $cmsApi, $articles }) {
  //   const slug = 'project-1'
  //   return {
  //     articles: $cmsApi.get('articles'),
  //     projects: $cmsApi.get('projects'),
  //     singleProject: $cmsApi.get('projects', slug),
  //     mainMenu: $cmsApi.get('main-menu'),
  //     mainNav: $cmsApi.get('main-nav')
  //   }
  // }
}
</script>
