<template>
  <div>
    <h2>Main Menu</h2>
    <pre>{{ mainMenu }}</pre>
    <h2>Courses</h2>
    <pre>{{ courses }}</pre>
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
      courses: $cmsApi.get('courses'),
      mainMenu: $cmsApi.get('main-menu'),
      mainNav: $cmsApi.get('main-nav')
    }
  }
}
</script>
