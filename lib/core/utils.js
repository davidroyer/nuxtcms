/**
 * Replaces hyphens with spaces. (only hyphens between word chars)
 */
const uniqueArray = originalArray => [...new Set(originalArray)]

function unhyphenate(str) {
  return str.replace(/(\w)(-)(\w)/g, '$1 $3')
}

const tagsTransformer = (tags) => {
  const tagsObject = {}

  tags.map((tag) => {
    const tagObject = {
      name: tag,
      slug: slugify(tag),
      title: titleCaseText(tag)
    }
    tagsObject[slugify(tag)] = tagObject
  })
  return tagsObject
}

const toTitleCase = function (str) {
  str = str.toLowerCase().split(' ')
  for (let i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1)
  }
  return unhyphenate(str.join(' '))
}

function titleCaseText(text) {
  const words = text.split('-')
  return words
    .map(word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
    .join(' ')
}

function removeExtension(file) {
  return file.replace(/\.[^/.]+$/, '')
}

function slugify(textToSlugify) {
  return textToSlugify
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
    .replace(/[\s_-]+/g, '-') // swap any length of whitespace, underscore, hyphen characters with a single -
    .replace(/^-+|-+$/g, '') // remove leading, trailing -
}

const createTagsList = (postsArray) => {
  const tagsArray = []

  postsArray.forEach((post) => {
    if (post.tags.length) {
      post.tags.forEach(tag => tagsArray.push(tag.slug))
    }
  })
  return uniqueArray(tagsArray)
}

const createTagsObject = (postsArray) => {
  const tagsDataObject = {}
  const tagsList = createTagsList(postsArray)

  tagsList.forEach((tag) => {
    const tagObject = createTagsObject(tag, postsArray)
    tagsDataObject[tagObject.slug] = tagObject
  })
  return tagsDataObject
}

const getPostsFromTag = (posts, tag) =>
  posts.filter(post => post.tags.map(tag => slugifyText(tag)).includes(tag))

const slugifyText = str =>
  slugify(str, { replacement: '-', lower: true, remove: /[$*_+~.()'"!\-:@]/g })

const arrayToObject = (arr, keyField) =>
  Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })))

const arrayFromObject = object =>
  Object.keys(object).map(key => object[key])

/**
 * Change string from snake case to camelCase
 *
 * @param {string} str Input snake case string
 * @return {string} Output camel case string
 */
const toCamelCase = (str) => {
  str = str.replace(/[-_\s]+(.)?/g, (match, ch) => // eslint-disable-line no-param-reassign
    (ch ? ch.toUpperCase() : '')
  )

  // Ensure first chat is always lowercase
  return str.substr(0, 1).toLowerCase() + str.substr(1)
}

exports.toCamelCase = toCamelCase
exports.uniqueArray = uniqueArray
exports.unhyphenate = unhyphenate
exports.toTitleCase = toTitleCase
exports.titleCaseText = titleCaseText
exports.tagsTransformer = tagsTransformer
exports.removeExtension = removeExtension
exports.slugify = slugify
exports.createTagsList = createTagsList
exports.createTagsObject = createTagsObject
exports.getPostsFromTag = getPostsFromTag
exports.slugifyText = slugifyText
exports.arrayToObject = arrayToObject
exports.arrayFromObject = arrayFromObject
