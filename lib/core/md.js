const MarkdownIt = require('markdown-it')
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

module.exports = new MarkdownIt(mdOptions)
  .use(container, 'warning')
  .use(container, 'tip')
  .use(container, 'danger')
  .use(linkAttributes, {
    attrs: {
      target: '_blank',
      rel: 'noopener'
    }
  })

// let MarkdownIt = require('markdown-it')
// const options = {
//   html: true,
//   breaks: true,
//   linkify: true
// }

// export default new MarkdownIt(options)

// for (let plugin of options.markdown) {
//   markdownInstance.use(plugin)
// }
// options.md = markdownInstance
// export default new MarkdownIt(options)

/**
 * Alternate highlight function
 */
// highlight(str, lang) {
//   let hl
//   if (lang && Object.keys(Prism.languages).includes(lang)) {
//     try {
//       hl = Prism.highlight(str, Prism.languages[lang])
//     } catch (error) {
//       console.error(str, lang, error)
//     }
//   } else {
//     lang = '__plain__'
//     hl = md.utils.escapeHtml(str)
//   }

//   return `<pre class="language-${lang}"><code class="language-${lang}">${hl}</code></pre>`
// }
