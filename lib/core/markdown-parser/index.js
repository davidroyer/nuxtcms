/* eslint-disable no-console */
const MarkdownIt = require('markdown-it')()
const anchor = require('markdown-it-anchor')
const toc = require('markdown-it-table-of-contents')
const linkAttributes = require('markdown-it-link-attributes')
const Prism = require('prismjs')
const containers = require('./containers')
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
  .use(anchor, {
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: '#'
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