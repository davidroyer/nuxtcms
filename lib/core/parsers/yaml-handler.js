import { titleCaseText } from '../utils'
export const yamlParser = {
  transformData(fileKey, data) {
    const slug = data.slug ? data.slug : fileKey
    const title = data.title ? data.title : titleCaseText(slug)

    data.slug = slug
    data.title = title

    return data
  }
}
