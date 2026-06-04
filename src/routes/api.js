import { Router } from 'express'
import { config } from '../config.js'
import { isValidTargetUrl } from '../lib/validate-url.js'
import { fetchThroughMullvad } from '../services/mullvad-fetch.js'

const router = Router()

function vpnHint() {
  return config.isProd
    ? 'Ensure Mullvad VPN is connected.'
    : 'Connect Mullvad VPN first. SOCKS5 is available while connected.'
}

router.get('/status', async (_req, res) => {
  try {
    const response = await fetchThroughMullvad('https://am.i.mullvad.net/json')
    if (!response.ok) {
      res.status(502).json({
        ok: false,
        error: `Status check failed (${response.status})`,
        hint: vpnHint(),
      })
      return
    }
    const data = await response.json()
    res.json({
      ok: true,
      socks: `${config.socksHost}:${config.socksPort}`,
      mullvad: data,
    })
  } catch (err) {
    res.status(503).json({
      ok: false,
      error: err.message,
      hint: vpnHint(),
    })
  }
})

router.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url
  if (!isValidTargetUrl(targetUrl)) {
    res.status(400).json({ error: 'Invalid or missing url parameter' })
    return
  }

  try {
    const upstream = await fetchThroughMullvad(targetUrl, {
      headers: { accept: req.headers.accept || '*/*' },
    })
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    const buffer = Buffer.from(await upstream.arrayBuffer())

    res.status(upstream.status)
    res.set('content-type', contentType)
    res.set('x-proxy-via', 'mullvad-socks5')
    res.send(buffer)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

export default router
