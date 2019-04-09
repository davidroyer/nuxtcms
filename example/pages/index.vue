<template>
  <div>
    <h2>Main Menu</h2>
    <pre>{{ mainMenu }}</pre>
    <h2>Services</h2>
    <pre>{{ services }}</pre>
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
      services: $cmsApi.get('pages', 'services'),
      mainMenu: $cmsApi.get('main-menu')
    }
  }
}
</script>
