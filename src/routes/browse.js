import { Router } from 'express'
import { config } from '../config.js'
import { isValidTargetUrl } from '../lib/validate-url.js'
import { rewriteHtml } from '../lib/html-rewrite.js'
import { fetchThroughMullvad } from '../services/mullvad-fetch.js'

const router = Router()

function proxyErrorMessage(err) {
  return config.isProd
    ? 'Unable to reach the destination. Verify Mullvad VPN is connected.'
    : `Proxy error: ${err.message}\n\nEnsure Mullvad VPN is connected.`
}

router.get('/', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl) {
    res.redirect('/')
    return
  }
  if (!isValidTargetUrl(targetUrl)) {
    res.status(400).send('Invalid URL. Only external http and https URLs are allowed.')
    return
  }

  try {
    const upstream = await fetchThroughMullvad(targetUrl, {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
    })

    const contentType = upstream.headers.get('content-type') || ''
    const body = await upstream.text()

    if (contentType.includes('text/html')) {
      res.status(upstream.status)
      res.set('content-type', 'text/html; charset=utf-8')
      res.send(rewriteHtml(body, targetUrl))
      return
    }

    res.redirect(`/api/proxy?url=${encodeURIComponent(targetUrl)}`)
  } catch (err) {
    res.status(502).send(proxyErrorMessage(err))
  }
})

router.post('/', async (req, res) => {
  const targetUrl = req.query.url || req.body?.url
  if (!isValidTargetUrl(targetUrl)) {
    res.status(400).send('Invalid form target URL')
    return
  }

  try {
    const upstream = await fetchThroughMullvad(targetUrl, {
      method: 'POST',
      headers: {
        'content-type': req.headers['content-type'] || 'application/x-www-form-urlencoded',
        accept: req.headers.accept || '*/*',
      },
      body: typeof req.body === 'string' ? req.body : new URLSearchParams(req.body).toString(),
    })

    const contentType = upstream.headers.get('content-type') || ''
    const text = await upstream.text()

    if (contentType.includes('text/html')) {
      res.status(upstream.status)
      res.set('content-type', 'text/html; charset=utf-8')
      res.send(rewriteHtml(text, targetUrl))
      return
    }

    res.status(upstream.status)
    res.set('content-type', contentType)
    res.send(text)
  } catch (err) {
    res.status(502).send(proxyErrorMessage(err))
  }
})

export default router
