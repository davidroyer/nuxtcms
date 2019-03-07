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
export default {
  asyncData({ app, $articles, $content, $mainMenu, $mainNav }) {
    const slug = 'project-1'
    return {
      // articles: $articles.all(),
      articles: $content.get('articles'),
      projects: $content.get('projects'),
      singleProject: $content.get('projects', slug),
      mainMenu: $mainMenu,
      mainNav: $mainNav
      // members: app.$data('members')
    }
  }
}
</script>
