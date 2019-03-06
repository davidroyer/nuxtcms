<template>
  <div>
    <h2>Projects</h2>
    <pre>{{ projects }}</pre>

    <hr>

    <h2>Articles</h2>
    <pre>{{ articles }}</pre>

    <hr>

    <h2>Main Menu</h2>
    <pre>{{ mainMenu }}</pre>
  </div>
</template>

<script>
export default {
  asyncData({ app, $articles, $content, $mainNav, $mainMenu }) {
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
