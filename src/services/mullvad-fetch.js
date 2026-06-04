import fetch from 'node-fetch'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { config, socksUrl } from '../config.js'

const agent = new SocksProxyAgent(socksUrl)

export async function fetchThroughMullvad(targetUrl, init = {}) {
  const headers = {
    'user-agent': init.headers?.['user-agent'] || config.userAgent,
    accept: init.headers?.accept || '*/*',
    ...init.headers,
  }

  return fetch(targetUrl, {
    method: init.method || 'GET',
    headers,
    body: init.body,
    redirect: 'follow',
    agent,
  })
}
