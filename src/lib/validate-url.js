export function isValidTargetUrl(raw) {
  if (!raw || typeof raw !== 'string') return false
  try {
    const parsed = new URL(raw)
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false
    if (host.endsWith('.local')) return false
    return true
  } catch {
    return false
  }
}

export function proxyBrowseUrl(targetUrl) {
  return `/browse?url=${encodeURIComponent(targetUrl)}`
}
