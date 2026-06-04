import { chromium } from 'playwright'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:3000'
const testUrl = process.env.TEST_URL || 'https://am.i.mullvad.net'
const artifactDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.artifacts')

async function run() {
  await fs.mkdir(artifactDir, { recursive: true })
  const browser = await chromium.launch({ headless: process.env.HEADLESS === '1' })
  const page = await (await browser.newContext()).newPage()

  await page.goto(baseUrl, { waitUntil: 'networkidle' })

  const vpnLabel = await page.locator('#vpn-label').textContent()
  console.log('VPN status:', vpnLabel?.trim())

  await page.fill('#url', testUrl)
  await page.click('button[type="submit"]')
  await page.waitForURL((url) => url.pathname === '/browse', { timeout: 30000 })

  console.log('Browse URL:', page.url())

  await page.screenshot({
    path: path.join(artifactDir, 'smoke.png'),
    fullPage: true,
  })

  await browser.close()
  console.log('Smoke test complete.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
