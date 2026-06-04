import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

export const config = {
  port: Number(process.env.PORT) || 3000,
  socksHost: process.env.MULLVAD_SOCKS_HOST || '10.64.0.1',
  socksPort: Number(process.env.MULLVAD_SOCKS_PORT) || 1080,
  isProd: process.env.NODE_ENV === 'production',
  publicDir: path.join(rootDir, 'public'),
  userAgent: 'MullvadWebProxy/1.0',
}

// socks5h: DNS through the tunnel
export const socksUrl = `socks5h://${config.socksHost}:${config.socksPort}`
