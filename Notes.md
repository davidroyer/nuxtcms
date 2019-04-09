# :package: NuxtCMS

## :heavy_check_mark: Features Overview

- :memo: Write content in Markdown
- :card_file_box: Use YAML for data
- :lock: Can have drafts for content
- :mag: easy access to get the content and data you need
- :label: Automatic tag API creation for any collections that include them in frontmatter
  <!-- - Easy & Consistent access -->

## :zap: The Quick Overview

1. :ballot_box_with_check: Everything lives in the `_CMS` directory
2. Two Directories for storing files
   - `Content` for Markdown collections
   - `Data` for Yaml collections and individual files
3. Everything can be accessed as `JSON` via the `$cmsApi.get()` method

---

## Example Structure

```sh
# INSIDE NUXT SOUCE DIRECTORY

_CMS
├── Content
│   ├── Blog
│   ├── Markdown
│   └── Pages
└── Data
    ├── Courses
    └── Projects
    ├── menu.yml
    └── settings.yml
```

- Markdown files go inside subdirectories within `Content`

- Directory name of `Blog` is NOT customizable

- YAML files go inside within `Data` as files or inside subdirectories

- Subdirectories inside `Data` are considered "`DataCollections`"
  This means they will a slug and title will automatically be provided for each
  item within the collection so they can be used for dynamic route generation

## :page_facing_up: Using Your Content & Data

NuxtCMS provides a helper via `$cmsApi` that is available on the context and instance.

Whether you want all the items within a content type or a specific item, you use the same method, `$cmsApi.get()` to get both content and data. For example:

```js
const allProjects = $cmsApi.get("projects");
const specificProject = $cmsApi.get("projects", params.slug);
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
