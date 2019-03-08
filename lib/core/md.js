/* eslint-disable no-console */
const MarkdownIt = require('markdown-it')()
const container = require('markdown-it-container')
// const emoji = require('markdown-it-emoji')
const linkAttributes = require('markdown-it-link-attributes')
const Prism = require('prismjs')
require('prismjs/components/index')()

const mdOptions = {
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: (code, lang) => {
    return `<pre class="language-${lang}"><code class="language-${lang}">${Prism.highlight(
      code,
      Prism.languages[lang] || Prism.languages.markup
    )}</code></pre>`
  }
}

MarkdownIt
  .set(mdOptions)
  .use(container, 'warning')
  .use(container, 'tip')
  .use(container, 'danger')
  .use(linkAttributes, {
    attrs: {
      target: '_blank',
      rel: 'noopener'
    }
  })

module.exports = MarkdownIt
