<template>
  <div>
    <h2>Projects</h2>
    <pre>{{ projects }}</pre>

    <br><hr><br>

    <h2>Articles</h2>
    <pre>{{ articles }}</pre>

    <br><hr><br>

    <h2>Main Menu</h2>
    <pre>{{ mainMenu }}</pre>
  </div>
</template>

<script>
const mainNav = require('@cmsApi/main-nav')
// eslint-disable-next-line no-console
console.log('mainNav: ', mainNav)

export default {
  asyncData({ $cmsApi, $articles }) {
    const slug = 'project-1'
    return {
      articles: $cmsApi.get('articles'),
      projects: $cmsApi.get('projects'),
      singleProject: $cmsApi.get('projects', slug),
      mainMenu: $cmsApi.get('main-menu'),
      mainNav: $cmsApi.get('main-nav')
    }
  }
}
</script>
