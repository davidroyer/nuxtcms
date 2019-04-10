<template>
  <div>
    <h2>Main Menu</h2>
    <pre>{{ mainMenu }}</pre>
    <h2>projects</h2>
    <pre>{{ projects }}</pre>
    <br><hr><br>

    <h2>Articles</h2>
    <pre>{{ articles }}</pre>
    <br><hr><br>
  </div>
</template>

<script>

export default {
  asyncData({ $cmsApi, $articles }) {
    return {
      articles: $cmsApi.get('blog'),
      projects: $cmsApi.get('projects'),
      mainMenu: $cmsApi.get('nav-menu')
    }
  }
}
</script>
