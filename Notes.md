# Features Overview

- Write content in Markdown
- Use YAML for data
- Easy & Consistent access
- Ability to use drafts

# The Quick Overview
1. Everything lives in the `_CMS` directory
2. Two Directories for storing files
    - `Content` for Markdown collections
    - `Data` for Yaml collections and individual files
3. Everything can be accessed as `JSON` via the `$cmsApi.get()` method

---

- Markdown files go inside subdirectories within `Content`

- Directory name of `Blog` is NOT customizable

- YAML files go inside within `Data` as files or inside subdirectories

- Subdirectories inside `Data` are considered "`DataCollections`"
  This means they will a slug and title will automatically be provided for each
  item within the collection so they can be used for dynamic route generation


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

## Directory Structure
```
───_CMS/
    ├───Content/
    │   ├───Blog/
    │   │   ├───article-1.md
    │   │   ├───example-1.md
    │   │   ├───possibly-helpful-emojis.md
    │   │   └───still-a-draft.md
    │   ├───Pages/
    │   │   ├───about.md
    │   │   └───info.md
    ├───Data/
    │   ├───Courses/
    │   │   ├───course-1.yml
    │   │   └───course-2.yml
    │   ├───Projects/
    │   │   ├───project-1.yml
    │   │   └───project-2.yml
    │   ├───main-menu.yml
    │   └───students.yml
```