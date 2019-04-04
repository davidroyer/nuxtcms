# Features Overview

- Write content in Markdown
- Use YAML for data
- Easy & Consistant access

# Using Your Content & Data

NuxtCMS provides a helper via `$cmsApi` that is available on the context and instance.

Whether you want all the items within a content type or a specific item, you use the same method, `$cmsApi.get()` to get both content and data. For example:

```js
 const allProjects = $cmsApi.get('projects')
 const specificProject = $cmsApi.get('projects', params.slug)
```


## Example: All items in a content type
```js
asyncData({ $cmsApi }) {
    const articles = $cmsApi.get('articles')
    return { articles }
}
```

## Example: An individual item
```js
asyncData({ $cmsApi, params }) {
    const article = $cmsApi.get('articles', params.slug)
    return { article }
}
```