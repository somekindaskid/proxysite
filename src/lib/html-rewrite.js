import * as cheerio from 'cheerio'
import { proxyBrowseUrl } from './validate-url.js'

export function rewriteHtml(html, baseUrl) {
  const $ = cheerio.load(html)
  const base = new URL(baseUrl)

  $('base').remove()
  $('head').prepend(`<base href="${base.href}">`)

  const attrMap = [
    ['a', 'href'],
    ['link', 'href'],
    ['script', 'src'],
    ['img', 'src'],
    ['source', 'src'],
    ['video', 'src'],
    ['audio', 'src'],
    ['iframe', 'src'],
    ['form', 'action'],
  ]

  for (const [tag, attr] of attrMap) {
    $(tag).each((_, el) => {
      const value = $(el).attr(attr)
      if (!value || value.startsWith('#') || value.startsWith('data:') || value.startsWith('javascript:') || value.startsWith('mailto:')) return
      try {
        const absolute = new URL(value, base).href
        $(el).attr(attr, proxyBrowseUrl(absolute))
      } catch {}
    })
  }

  return $.html()
}
