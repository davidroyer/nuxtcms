/* eslint-disable no-console */
const MarkdownIt = require('markdown-it')()
const anchor = require('markdown-it-anchor')
const toc = require('markdown-it-table-of-contents')
const linkAttributes = require('markdown-it-link-attributes')
const attributes = require('markdown-it-attrs')
const mdDefinitionList = require('markdown-it-deflist')
const mdEmoji = require('markdown-it-emoji')
// eslint-disable-next-line no-unused-vars
const customBlock = require('markdown-it-custom-block')
const Prism = require('prismjs')
const loadLanguages = require('prismjs/components/')
const containers = require('./containers')
loadLanguages(['json', 'jsx', 'yaml'])

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
  .use(attributes)
  .use(mdEmoji)
  .use(mdDefinitionList)
  .use(anchor, {
    permalink: false,
    permalinkBefore: false
    // permalinkSymbol: '#'
  })
  .use(toc, {
    includeLevel: [2, 3]
  })
  .use(containers)
  .use(linkAttributes, {
    attrs: {
      target: '_blank',
      rel: 'noopener'
    }
  })

module.exports = MarkdownIt
