# Overview / Purpose

To provide a fluid and set way of how to handle content and data with Nuxt.js sites and apps.
I am constantly using Nuxt want a standardized manner of handling both of these so I don't waste my enery 
on it.

# Features

## Static Route Generator Helper

**_Inside `nuxt.config.js`_**

```js
const { cmsRouteGenerator } = require("@droyer/nuxtcms/");

export default {
  generate: {
    fallback: true,
    routes: () => {
      const blogRoutes = cmsRouteGenerator("articles", require(`./static/api/articles`));
      const projectRoutes = cmsRouteGenerator("projects", require(`./static/api/projects`));
      return [...blogRoutes, ...projectRoutes];
    }
  }
};
```

## Automatic Reloading of Content

You'll get a instantaneous rerender when updating any of your Data or Content


## Plugin Injection

```js
<script>
export default {
  asyncData({ $cmsApi, params }) {
    const project = $cmsApi.get('projects', params.slug)
    return { project }
  }
}
</script>
```
